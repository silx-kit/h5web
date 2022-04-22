import type { ValuesStoreParams } from '@h5web/app';
import { convertDtype, ProviderApi } from '@h5web/app';
import { getNameFromPath } from '@h5web/app/src/providers/utils';
import type {
  AttributeValues,
  Dataset,
  Entity,
  Group,
  GroupWithChildren,
  UnresolvedEntity,
} from '@h5web/shared';
import {
  buildEntityPath,
  DTypeClass,
  EntityKind,
  hasScalarShape,
} from '@h5web/shared';
import { File as H5WasmFile, FS, ready } from 'h5wasm';

import type { H5WasmAttribute, H5WasmEntity } from './models';
import {
  assertH5WasmDataset,
  assertH5WasmEntityWithAttrs,
  isH5WasmDataset,
  isH5WasmGroup,
  isHDF5,
} from './utils';

export class H5WasmApi extends ProviderApi {
  private readonly file: Promise<H5WasmFile>;

  public constructor(filename: string, buffer: ArrayBuffer) {
    super(filename);

    if (!isHDF5(buffer)) {
      throw new Error('Expected valid HDF5 file');
    }

    this.file = this.initFile(buffer);
  }

  public async getEntity(path: string): Promise<Entity> {
    const file = await this.file;
    const h5wEntity = file.get(path);

    return this.processH5WasmEntity(getNameFromPath(path), path, h5wEntity);
  }

  public async getValue(params: ValuesStoreParams): Promise<unknown> {
    const { dataset } = params;

    const file = await this.file;
    const h5wDataset = file.get(dataset.path);
    assertH5WasmDataset(h5wDataset);

    const array = h5wDataset.value;
    return hasScalarShape(dataset) ? array[0] : array;
  }

  public async getAttrValues(entity: Entity): Promise<AttributeValues> {
    const file = await this.file;
    const h5wEntity = file.get(entity.path);
    assertH5WasmEntityWithAttrs(h5wEntity);

    return Object.fromEntries(
      Object.entries(h5wEntity.attrs).map(([name, attr]) => {
        return [name, (attr as H5WasmAttribute).value];
      })
    );
  }

  public async cleanUp(): Promise<void> {
    const file = await this.file;
    file.close();
  }

  private async initFile(buffer: ArrayBuffer): Promise<H5WasmFile> {
    await ready;

    FS.writeFile(this.filepath, new Uint8Array(buffer), { flags: 'w+' });
    return new H5WasmFile(this.filepath, 'r');
  }

  private processH5WasmEntity(
    name: string,
    path: string,
    h5wEntity: H5WasmEntity,
    isChild = false
  ): Entity {
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

      const children = h5wEntity.keys().map((name) => {
        const h5wChild = h5wEntity.get(name);
        const childPath = buildEntityPath(path, name);
        return this.processH5WasmEntity(name, childPath, h5wChild, true);
      });

      return { ...baseGroup, children } as GroupWithChildren;
    }

    if (isH5WasmDataset(h5wEntity)) {
      const { shape, dtype } = h5wEntity;

      return {
        ...baseEntity,
        kind: EntityKind.Dataset,
        attributes: this.processH5WasmAttrs(h5wEntity.attrs),
        shape,
        type:
          typeof dtype === 'string'
            ? convertDtype(dtype)
            : { class: DTypeClass.Compound, fields: dtype.compound },
        rawType: dtype,
      } as Dataset;
    }

    return {
      ...baseEntity,
      kind: EntityKind.Unresolved,
    } as UnresolvedEntity;
  }

  private processH5WasmAttrs(h5wAttrs: Record<string, unknown>) {
    return Object.entries(h5wAttrs).map(([name, attr]) => {
      const { shape, dtype } = attr as H5WasmAttribute;
      return { name, shape, type: convertDtype(dtype) };
    });
  }
}
