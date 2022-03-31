import type {
  Attribute,
  AttributeValues,
  Dataset,
  Entity,
  GroupWithChildren,
  Shape,
  UnresolvedEntity,
} from '@h5web/shared';
import { hasScalarShape, EntityKind, buildEntityPath } from '@h5web/shared';
import {
  Dataset as h5wasm_Dataset,
  ready as h5wasm_ready,
  File as h5wasm_File,
  Group as h5wasm_Group,
  BrokenSoftLink as h5wasm_BrokenSoftLink,
  ExternalLink as h5wasm_ExternalLink,
  FS as h5wasm_FS,
} from 'h5wasm';

import { ProviderApi } from '../api';
import type { ValuesStoreParams } from '../models';
import { convertDtype } from '../utils';

function convert_attrs(attrs: object): Attribute[] {
  return Object.entries(attrs).map(([name, value]) => ({
    name,
    shape: value.shape,
    type: convertDtype((value as h5wasm_attr).dtype),
  }));
}

interface h5wasm_attr {
  value: unknown;
  shape: Shape;
  dtype: string;
}

export class H5WasmApi extends ProviderApi {
  /* API compatible with h5wasm@0.3.1 */

  public file_promise: Promise<h5wasm_File>;

  public constructor(filepath: string) {
    super(filepath);
    this.file_promise = this.fetchFile(filepath);
  }

  public async getEntity(path: string): Promise<Entity> {
    const file = await this.file_promise;
    const entity_obj = file.get(path);
    return this.processEntityObject(path, path, entity_obj, true);
  }

  public async getValue(params: ValuesStoreParams): Promise<unknown> {
    const { dataset } = params;
    const file = await this.file_promise;
    const dataset_obj = file.get(dataset.path) as h5wasm_Dataset;
    const array = dataset_obj.value;
    return hasScalarShape(dataset) ? array[0] : array;
  }

  public async getAttrValues(entity: Entity): Promise<AttributeValues> {
    const { path, kind } = entity;
    if (kind === EntityKind.Group || kind === EntityKind.Dataset) {
      const file = await this.file_promise;
      const entity_obj = file.get(path) as h5wasm_Dataset | h5wasm_Group;
      return Object.fromEntries(
        Object.entries(entity_obj.attrs).map(([name, value]) => [
          name,
          (value as h5wasm_attr).value,
        ])
      );
    }
    return {};
  }

  private processEntityObject(
    name: string,
    path: string,
    entity_obj:
      | h5wasm_Group
      | h5wasm_Dataset
      | h5wasm_BrokenSoftLink
      | h5wasm_ExternalLink,
    recursive = false
  ): Entity {
    const baseEntity = {
      name,
      path,
    };

    if (entity_obj instanceof h5wasm_Group) {
      let children: Entity[] = [];
      if (recursive) {
        children = entity_obj.keys().map((name) => {
          const item = entity_obj.get(name);
          return this.processEntityObject(
            name,
            buildEntityPath(path, name),
            item,
            false
          );
        });
      }
      return {
        ...baseEntity,
        kind: EntityKind.Group,
        attributes: convert_attrs(entity_obj.attrs),
        children,
      } as GroupWithChildren;
    } else if (entity_obj instanceof h5wasm_Dataset) {
      return {
        ...baseEntity,
        kind: EntityKind.Dataset,
        attributes: convert_attrs(entity_obj.attrs),
        shape: entity_obj.shape,
        type: convertDtype(entity_obj.dtype as string),
      } as Dataset;
    } else if (entity_obj instanceof h5wasm_BrokenSoftLink) {
      const { target } = entity_obj;
      return {
        ...baseEntity,
        attributes: [],
        kind: EntityKind.Unresolved,
        link: { class: 'Soft', path: target },
      };
    } else if (entity_obj instanceof h5wasm_ExternalLink) {
      const { filename, obj_path } = entity_obj;
      return {
        ...baseEntity,
        attributes: [],
        kind: EntityKind.Unresolved,
        link: { class: 'External', path: obj_path, file: filename },
      };
    }

    return {
      ...baseEntity,
      kind: EntityKind.Unresolved,
    } as UnresolvedEntity;
  }

  private async fetchFile(filepath: string): Promise<h5wasm_File> {
    await h5wasm_ready;
    const response = await this.client.get<ArrayBuffer>(filepath, {
      responseType: 'arraybuffer',
    });
    const ab = response.data;
    h5wasm_FS.writeFile('current.h5', new Uint8Array(ab));
    return new h5wasm_File('current.h5', 'r');
  }
}
