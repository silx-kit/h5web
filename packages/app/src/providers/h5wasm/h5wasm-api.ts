import type {
  ArrayShape,
  Attribute,
  AttributeValues,
  Dataset,
  Entity,
  GroupWithChildren,
  NumericType,
  Shape,
} from '@h5web/shared';
import { hasScalarShape, EntityKind } from '@h5web/shared';
import type { Dataset as h5wasm_Dataset } from 'h5wasm';
import {
  ready as h5wasm_ready,
  File,
  Group as h5wasm_Group,
  FS as h5wasm_FS,
} from 'h5wasm';

import { ProviderApi } from '../api';
import type { ExportFormat, ValuesStoreParams } from '../models';
import { convertDtype, handleAxiosError } from '../utils';
import type {
  H5WasmAttribute,
  H5WasmAttrValuesResponse,
  H5WasmDataResponse,
  H5WasmEntityResponse,
} from './models';

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
  /* API compatible with h5wasm@0.2.10 */

  public file_promise: Promise<File>;

  public constructor(filepath: string) {
    super(filepath);
    this.file_promise = this.fetchFile(filepath);
  }

  public async getEntity(path: string): Promise<Entity> {
    const file = await this.file_promise;
    const entity_obj = file.get(path);
    return this.processEntityObject(path, path, entity_obj, true);
  }

  public async getValue(
    params: ValuesStoreParams
  ): Promise<H5WasmDataResponse> {
    const { dataset } = params;
    const file = await this.file_promise;
    const dataset_obj = file.get(dataset.path) as h5wasm_Dataset;
    const array = dataset_obj.value;
    return hasScalarShape(dataset) ? array[0] : array;
  }

  public async getAttrValues(entity: Entity): Promise<AttributeValues> {
    const { path, attributes } = entity;
    return attributes.length > 0 ? this.convertAttrValues(path) : {};
  }

  public getExportURL(
    dataset: Dataset<ArrayShape, NumericType>,
    selection: string | undefined,
    format: ExportFormat
  ): string | undefined {
    const { baseURL, params } = this.client.defaults;

    const searchParams = new URLSearchParams(params as Record<string, string>);
    searchParams.set('path', dataset.path);
    searchParams.set('format', format);

    if (selection) {
      searchParams.set('selection', selection);
    }

    return `${baseURL as string}/data/?${searchParams.toString()}`;
  }

  private async convertAttrValues(
    path: string
  ): Promise<H5WasmAttrValuesResponse> {
    const file = await this.file_promise;
    const entity_obj = file.get(path);
    return Object.fromEntries(
      Object.entries(entity_obj.attrs).map(([name, value]) => [
        name,
        (value as h5wasm_attr).value,
      ])
    );
  }

  private processEntityObject(
    name: string,
    path: string,
    entity_obj: h5wasm_Group | h5wasm_Dataset,
    recursive = false
  ): Entity {
    const kind =
      entity_obj instanceof h5wasm_Group
        ? EntityKind.Group
        : EntityKind.Dataset;
    const baseEntity = {
      name,
      path,
      kind,
      attributes: convert_attrs(entity_obj.attrs),
    };

    if (entity_obj instanceof h5wasm_Group) {
      let children: Entity[] = [];
      if (recursive) {
        children = entity_obj.keys().map((name) => {
          const item = entity_obj.get(name);
          return this.processEntityObject(name, item.path, item, false);
        });
      }
      return {
        ...baseEntity,
        children,
      } as GroupWithChildren;
    }

    return {
      ...baseEntity,
      shape: entity_obj.shape,
      type: convertDtype(entity_obj.dtype as string),
    } as Dataset;
  }

  private async fetchFile(filepath: string): Promise<File> {
    await h5wasm_ready;
    const response = await this.client.get<ArrayBuffer>(filepath, {
      responseType: 'arraybuffer',
    });
    const ab = response.data;
    h5wasm_FS.writeFile('current.h5', new Uint8Array(ab));
    return new File('current.h5', 'r');
  }
}
