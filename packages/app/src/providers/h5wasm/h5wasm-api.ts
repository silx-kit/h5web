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
import type { File as H5WasmFile } from 'h5wasm';
import {
  Dataset as H5WasmDataset,
  Group as H5WasmGroup,
  BrokenSoftLink as H5WasmBrokenSoftLink,
  ExternalLink as H5WasmExternalLink,
} from 'h5wasm';

import { ProviderApi } from '../api';
import type { ValuesStoreParams } from '../models';
import { convertDtype } from '../utils';

function convert_attrs(attrs: object): Attribute[] {
  return Object.entries(attrs).map(([name, value]) => ({
    name,
    shape: value.shape,
    type: convertDtype((value as H5WasmAttribute).dtype),
  }));
}

interface H5WasmAttribute {
  value: unknown;
  shape: Shape;
  dtype: string;
}

export class H5WasmApi extends ProviderApi {
  /* API compatible with h5wasm@0.3.1 */

  public file_promise: Promise<H5WasmFile>;

  public constructor(file_promise: Promise<H5WasmFile>, filepath: string) {
    super(filepath);
    this.file_promise = file_promise;
  }

  public async getEntity(path: string): Promise<Entity> {
    const file = await this.file_promise;
    const entity_obj = file.get(path);
    return this.processEntityObject(path, path, entity_obj, true);
  }

  public async getValue(params: ValuesStoreParams): Promise<unknown> {
    const { dataset } = params;
    const file = await this.file_promise;
    const dataset_obj = file.get(dataset.path) as H5WasmDataset;
    const array = dataset_obj.value;
    return hasScalarShape(dataset) ? array[0] : array;
  }

  public async getAttrValues(entity: Entity): Promise<AttributeValues> {
    const { path, kind } = entity;
    if (kind === EntityKind.Group || kind === EntityKind.Dataset) {
      const file = await this.file_promise;
      const entity_obj = file.get(path) as H5WasmDataset | H5WasmGroup;
      return Object.fromEntries(
        Object.entries(entity_obj.attrs).map(([name, value]) => [
          name,
          (value as H5WasmAttribute).value,
        ])
      );
    }
    return {};
  }

  private processEntityObject(
    name: string,
    path: string,
    entity_obj:
      | H5WasmGroup
      | H5WasmDataset
      | H5WasmBrokenSoftLink
      | H5WasmExternalLink,
    recursive = false
  ): Entity {
    const baseEntity = {
      name,
      path,
    };

    if (entity_obj instanceof H5WasmGroup) {
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
    } else if (entity_obj instanceof H5WasmDataset) {
      return {
        ...baseEntity,
        kind: EntityKind.Dataset,
        attributes: convert_attrs(entity_obj.attrs),
        shape: entity_obj.shape,
        type: convertDtype(entity_obj.dtype as string),
      } as Dataset;
    } else if (entity_obj instanceof H5WasmBrokenSoftLink) {
      const { target } = entity_obj;
      return {
        ...baseEntity,
        attributes: [],
        kind: EntityKind.Unresolved,
        link: { class: 'Soft', path: target },
      };
    } else if (entity_obj instanceof H5WasmExternalLink) {
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
}
