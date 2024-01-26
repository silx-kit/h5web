import type { ExportFormat, ExportURL, ValuesStoreParams } from '@h5web/app';
import {
  DataProviderApi,
  flattenValue,
  getNameFromPath,
  sliceValue,
} from '@h5web/app';
import { assertNonNull, hasArrayShape } from '@h5web/shared/guards';
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
} from '@h5web/shared/hdf5-models';
import { EntityKind } from '@h5web/shared/hdf5-models';
import { buildEntityPath } from '@h5web/shared/hdf5-utils';
import type { Attribute as H5WasmAttribute, Filter, Module } from 'h5wasm';
import {
  BrokenSoftLink as H5WasmSoftLink,
  Dataset as H5WasmDataset,
  Datatype as H5WasmDatatype,
  ExternalLink as H5WasmExternalLink,
  File as H5WasmFile,
  Group as H5WasmGroup,
  ready as h5wasmReady,
} from 'h5wasm';
import { nanoid } from 'nanoid';

import { assertH5WasmDataset, hasInt64Type } from './guards';
import type { H5WasmAttributes, H5WasmEntity } from './models';
import {
  convertSelectionToRanges,
  parseDType,
  PLUGINS_BY_FILTER_ID,
} from './utils';

const PLUGINS_PATH = '/plugins'; // path to plugins on EMScripten virtual file system

export class H5WasmApi extends DataProviderApi {
  private readonly h5wasm: Promise<typeof Module>;
  private readonly file: Promise<H5WasmFile>;

  public constructor(
    filename: string,
    buffer: ArrayBuffer,
    private readonly _getExportURL?: DataProviderApi['getExportURL'],
    private readonly getPlugin?: (
      name: string,
    ) => Promise<ArrayBuffer | undefined>,
  ) {
    super(filename);

    this.h5wasm = this.initH5Wasm();
    this.file = this.initFile(buffer);
  }

  public async getEntity(path: string): Promise<ProvidedEntity> {
    const h5wEntity = await this.getH5WasmEntity(path);
    return this.parseEntity(getNameFromPath(path), path, h5wEntity);
  }

  public async getValue(params: ValuesStoreParams): Promise<unknown> {
    const { dataset, selection } = params;

    const h5wDataset = await this.getH5WasmEntity(dataset.path);
    assertH5WasmDataset(h5wDataset);

    // Ensure all filters are supported and loaded (if available)
    await this.processFilters(h5wDataset.filters);

    /* h5wasm returns bigints for (u)int64 dtypes, so we use `to_array` to get numbers instead.
     * We do this only for datasets that are supported by at least one visualization (other than `RawVis`),
     * so for (u)int64 scalars/arrays, and for compound datasets with at least one (u)int64 field (`MatrixVis`). */
    if (hasInt64Type(dataset)) {
      const rawValue = h5wDataset.to_array();

      // `to_array` returns nested JS arrays for nD datasets, so we need to re-flatten them
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

    if (!('attrs' in h5wEntity)) {
      throw new Error('Expected H5Wasm entity with attributes');
    }

    return Object.fromEntries(
      Object.entries(h5wEntity.attrs).map(([name, attr]) => {
        return [name, attr.to_array()];
      }),
    );
  }

  public override getExportURL<D extends Dataset<ArrayShape>>(
    format: ExportFormat,
    dataset: D,
    selection: string | undefined,
    value: Value<D>,
  ): ExportURL {
    const url = this._getExportURL?.(format, dataset, selection, value);
    if (url) {
      return url;
    }

    if (format === 'json') {
      return async () => new Blob([JSON.stringify(value, null, 2)]);
    }

    return undefined;
  }

  public async cleanUp(): Promise<void> {
    const file = await this.file;
    file.close();
  }

  public override async getSearchablePaths(root: string): Promise<string[]> {
    const file = await this.file;

    const h5wEntity = file.get(root);

    if (h5wEntity instanceof H5WasmGroup) {
      // Build absolute paths since .paths() are relative
      return h5wEntity.paths().map((path) => `${root}${path}`);
    }

    return [];
  }

  private async initH5Wasm(): Promise<typeof Module> {
    const module = await h5wasmReady;

    // Replace default plugins path
    module.remove_plugin_search_path(0);
    module.insert_plugin_search_path(PLUGINS_PATH, 0);

    // Create plugins folder on Emscripten virtual file system
    module.FS.mkdirTree(PLUGINS_PATH);

    return module;
  }

  private async initFile(buffer: ArrayBuffer): Promise<H5WasmFile> {
    const h5Module = await this.h5wasm;

    // Write HDF5 file to Emscripten virtual file system
    // https://emscripten.org/docs/api_reference/Filesystem-API.html#FS.writeFile
    const id = nanoid(); // use unique ID instead of `this.filepath` to avoid slashes and other unsupported characters
    h5Module.FS.writeFile(id, new Uint8Array(buffer), { flags: 'w+' });

    return new H5WasmFile(id, 'r');
  }

  private async processFilters(filters: Filter[]): Promise<void> {
    const h5Module = await this.h5wasm;

    for await (const filter of filters) {
      if (filter.id < h5Module.H5Z_FILTER_RESERVED) {
        continue; // filter supported out of the box
      }

      const plugin = PLUGINS_BY_FILTER_ID[filter.id];
      if (!plugin || !this.getPlugin) {
        throw new Error(
          `Compression filter ${filter.id} not supported (${filter.name})`,
        );
      }

      const pluginPath = `${PLUGINS_PATH}/libH5Z${plugin}.so`;

      if (h5Module.FS.analyzePath(pluginPath).exists) {
        continue; // plugin already loaded
      }

      const buffer = await this.getPlugin(plugin);
      if (!buffer) {
        throw new Error(`Compression plugin ${plugin} not supported`);
      }

      h5Module.FS.writeFile(pluginPath, new Uint8Array(buffer));
    }
  }

  private async getH5WasmEntity(
    path: string,
  ): Promise<NonNullable<H5WasmEntity>> {
    const file = await this.file;

    const h5wEntity = file.get(path);
    assertNonNull(
      h5wEntity,
      path === '/' ? `Expected valid HDF5 file` : `No entity found at ${path}`,
    );

    return h5wEntity;
  }

  private parseEntity(
    name: string,
    path: string,
    h5wEntity: H5WasmEntity,
    isChild: true,
  ): ChildEntity;

  private parseEntity(
    name: string,
    path: string,
    h5wEntity: H5WasmEntity,
    isChild?: false,
  ): ProvidedEntity;

  private parseEntity(
    name: string,
    path: string,
    h5wEntity: H5WasmEntity,
    isChild = false,
  ): ProvidedEntity | ChildEntity {
    const baseEntity = { name, path };

    if (h5wEntity instanceof H5WasmGroup) {
      const baseGroup: Group = {
        ...baseEntity,
        kind: EntityKind.Group,
        attributes: this.parseAttributes(h5wEntity.attrs),
      };

      if (isChild) {
        return baseGroup;
      }

      return {
        ...baseGroup,
        children: h5wEntity.keys().map((childName) => {
          const h5wChild = h5wEntity.get(childName);

          const childPath = buildEntityPath(path, childName);
          return this.parseEntity(childName, childPath, h5wChild, true);
        }),
      };
    }

    if (h5wEntity instanceof H5WasmDataset) {
      const { metadata, filters } = h5wEntity;
      const { chunks, maxshape, shape, ...rawType } = metadata; // keep `rawType` concise

      return {
        ...baseEntity,
        kind: EntityKind.Dataset,
        shape: metadata.shape,
        type: parseDType(metadata),
        chunks: metadata.chunks ?? undefined,
        filters,
        attributes: this.parseAttributes(h5wEntity.attrs),
        rawType,
      };
    }

    if (h5wEntity instanceof H5WasmSoftLink) {
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

    if (h5wEntity instanceof H5WasmExternalLink) {
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
      kind:
        h5wEntity instanceof H5WasmDatatype
          ? EntityKind.Datatype
          : EntityKind.Unresolved,
    };
  }

  private parseAttributes(h5wAttrs: H5WasmAttributes): Attribute[] {
    return Object.entries(h5wAttrs).map(([name, attr]) => {
      const { shape, metadata } = attr as unknown as H5WasmAttribute;
      return {
        name,
        shape: shape as Shape,
        type: parseDType(metadata),
      };
    });
  }
}
