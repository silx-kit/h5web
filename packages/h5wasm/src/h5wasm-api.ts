import type { ValuesStoreParams, ExportFormat, ExportURL } from '@h5web/app';
import {
  flattenValue,
  getNameFromPath,
  ProviderApi,
  sliceValue,
} from '@h5web/app';
import type {
  ArrayShape,
  Attribute,
  ChildEntity,
  Dataset,
  Entity,
  Group,
  ProvidedEntity,
  Shape,
  Value,
} from '@h5web/shared';
import {
  assertNonNull,
  buildEntityPath,
  EntityKind,
  hasArrayShape,
  hasBoolType,
} from '@h5web/shared';
import type { Attribute as H5WasmAttribute } from 'h5wasm';
import { File as H5WasmFile, ready as h5wasmReady, Module } from 'h5wasm';
import { nanoid } from 'nanoid';

import {
  assertH5WasmDataset,
  assertH5WasmEntityWithAttrs,
  hasInt64Type,
  isH5WasmDataset,
  isH5WasmDatatype,
  isH5WasmExternalLink,
  isH5WasmGroup,
  isH5WasmSoftLink,
} from './guards';
import type { H5WasmAttributes, H5WasmEntity } from './models';
import { convertMetadataToDType, convertSelectionToRanges } from './utils';

export class H5WasmApi extends ProviderApi {
  private readonly file: Promise<H5WasmFile>;

  public constructor(
    filename: string,
    buffer: ArrayBuffer,
    private readonly _getExportURL?: ProviderApi['getExportURL']
  ) {
    super(filename);
    this.file = this.initFile(buffer);
  }

  public async getEntity(path: string): Promise<ProvidedEntity> {
    const h5wEntity = await this.getH5WasmEntity(path);
    return this.processH5WasmEntity(getNameFromPath(path), path, h5wEntity);
  }

  public async getValue(params: ValuesStoreParams): Promise<unknown> {
    const { dataset, selection } = params;

    const h5wDataset = await this.getH5WasmEntity(dataset.path);
    assertH5WasmDataset(h5wDataset);

    if (h5wDataset.filters?.some((f) => f.id >= Module.H5Z_FILTER_RESERVED)) {
      throw new Error('Compression filter not supported');
    }

    // h5wasm returns integers for bool and BigInt for (u)int64
    // So we use to_array instead to have bool and numbers resp.
    if (hasBoolType(dataset) || hasInt64Type(dataset)) {
      const rawValue = h5wDataset.to_array();
      const value = hasArrayShape(dataset)
        ? flattenValue(rawValue, dataset)
        : rawValue;

      return selection ? sliceValue(value, dataset, selection) : value;
    }

    if (selection) {
      const ranges = convertSelectionToRanges(h5wDataset, selection);
      return h5wDataset.slice(ranges);
    }

    return h5wDataset.value;
  }

  public async getAttrValues(entity: Entity) {
    const h5wEntity = await this.getH5WasmEntity(entity.path);
    assertH5WasmEntityWithAttrs(h5wEntity);

    return Object.fromEntries(
      Object.entries(h5wEntity.attrs).map(([name, attr]) => {
        return [name, attr.to_array()];
      })
    );
  }

  public getExportURL<D extends Dataset<ArrayShape>>(
    format: ExportFormat,
    dataset: D,
    selection: string | undefined,
    value: Value<D>
  ): ExportURL {
    return this._getExportURL?.(format, dataset, selection, value);
  }

  public async cleanUp(): Promise<void> {
    const file = await this.file;
    file.close();
  }

  public async getSearchablePaths(root: string): Promise<string[]> {
    const file = await this.file;

    const h5wEntity = file.get(root);

    if (isH5WasmGroup(h5wEntity)) {
      // Build absolute paths since .paths() are relative
      return h5wEntity.paths().map((path) => `${root}${path}`);
    }

    return [];
  }

  private async initFile(buffer: ArrayBuffer): Promise<H5WasmFile> {
    const { FS } = await h5wasmReady;

    // `FS` is guaranteed to be defined once H5Wasm is ready
    // https://github.com/silx-kit/h5web/pull/1082#discussion_r858613242
    assertNonNull(FS);

    // Write file to Emscripten virtual file system
    // https://emscripten.org/docs/api_reference/Filesystem-API.html#FS.writeFile
    const id = nanoid(); // use unique ID instead of `this.filepath` to avoid slashes and other unsupported characters
    FS.writeFile(id, new Uint8Array(buffer), { flags: 'w+' });

    return new H5WasmFile(id, 'r');
  }

  private async getH5WasmEntity(
    path: string
  ): Promise<NonNullable<H5WasmEntity>> {
    const file = await this.file;

    const h5wEntity = file.get(path);
    assertNonNull(
      h5wEntity,
      path === '/' ? `Expected valid HDF5 file` : `No entity found at ${path}`
    );

    return h5wEntity;
  }

  private processH5WasmEntity(
    name: string,
    path: string,
    h5wEntity: H5WasmEntity,
    isChild: true
  ): ChildEntity;

  private processH5WasmEntity(
    name: string,
    path: string,
    h5wEntity: H5WasmEntity,
    isChild?: false
  ): ProvidedEntity;

  private processH5WasmEntity(
    name: string,
    path: string,
    h5wEntity: H5WasmEntity,
    isChild = false
  ): ProvidedEntity | ChildEntity {
    const baseEntity = { name, path };

    if (isH5WasmGroup(h5wEntity)) {
      const baseGroup: Group = {
        ...baseEntity,
        kind: EntityKind.Group,
        attributes: this.processH5WasmAttrs(h5wEntity.attrs),
      };

      if (isChild) {
        return baseGroup;
      }

      return {
        ...baseGroup,
        children: h5wEntity.keys().map((childName) => {
          const h5wChild = h5wEntity.get(childName);

          const childPath = buildEntityPath(path, childName);
          return this.processH5WasmEntity(childName, childPath, h5wChild, true);
        }),
      };
    }

    if (isH5WasmDataset(h5wEntity)) {
      const { shape, metadata, dtype, filters } = h5wEntity;
      return {
        ...baseEntity,
        kind: EntityKind.Dataset,
        attributes: this.processH5WasmAttrs(h5wEntity.attrs),
        shape,
        type: convertMetadataToDType(metadata),
        rawType: dtype,
        filters,
      };
    }

    if (isH5WasmSoftLink(h5wEntity)) {
      return {
        ...baseEntity,
        attributes: [],
        kind: EntityKind.Unresolved,
        link: {
          class: 'Soft',
          path: h5wEntity.target,
        },
      };
    }

    if (isH5WasmExternalLink(h5wEntity)) {
      return {
        ...baseEntity,
        attributes: [],
        kind: EntityKind.Unresolved,
        link: {
          class: 'External',
          path: h5wEntity.obj_path,
          file: h5wEntity.filename,
        },
      };
    }

    return {
      ...baseEntity,
      attributes: [],
      kind: isH5WasmDatatype(h5wEntity)
        ? EntityKind.Datatype
        : EntityKind.Unresolved,
    };
  }

  private processH5WasmAttrs(h5wAttrs: H5WasmAttributes): Attribute[] {
    return Object.entries(h5wAttrs).map(([name, attr]) => {
      const { shape, metadata } = attr as unknown as H5WasmAttribute;
      return {
        name,
        shape: shape as Shape,
        type: convertMetadataToDType(metadata),
      };
    });
  }
}
