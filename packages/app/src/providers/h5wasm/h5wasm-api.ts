import type {
  ArrayShape,
  Attribute,
  AttributeValues,
  Dataset,
  Entity,
  Group,
  GroupWithChildren,
  NumericType,
  UnresolvedEntity,
} from '@h5web/shared';
import { Shape, DType, DTypeClass } from '@h5web/shared';
import { hasScalarShape, buildEntityPath, EntityKind } from '@h5web/shared';
import {
  ready as h5wasm_ready,
  File,
  Group as h5wasm_Group,
  Dataset as h5wasm_Dataset,
  FS as h5wasm_FS,
} from 'h5wasm';
import { isString } from 'lodash';

import { ProviderApi } from '../api';
import type { ExportFormat, ValuesStoreParams } from '../models';
import { convertDtype, handleAxiosError } from '../utils';
import type {
  H5WasmAttribute,
  H5WasmAttrValuesResponse,
  H5WasmDataResponse,
  H5WasmEntityResponse,
} from './models';
import {
  isDatasetResponse,
  isExternalLinkResponse,
  isGroupResponse,
  isSoftLinkResponse,
  typedArrayFromDType,
} from './utils';

function convert_attrs(attrs: object): Attribute[] {
  return Object.entries(attrs).map(([name, value]) => ({
    name,
    shape: [],
    type: convertDtype('<f4'),
  }));
}

export class H5WasmApi extends ProviderApi {
  /* API compatible with h5wasm@0.2.10 */
  public file_obj: File | undefined;

  public constructor(filepath: string) {
    super(filepath);
  }

  public async getEntity(path: string): Promise<Entity> {
    if (this.file_obj === null) {
      await h5wasm_ready;
      const response = await this.client.get<ArrayBuffer>(this.filepath, {
        responseType: 'arraybuffer',
      });
      const ab = response.data;
      h5wasm_FS.writeFile('current.h5', new Uint8Array(ab));
      this.file_obj = new File('current.h5', 'r');
    }

    const entity_obj = (this.file_obj as File).get(path);
    if (entity_obj instanceof h5wasm_Group) {
      return {
        name: path,
        path,
        kind: EntityKind.Group,
        attributes: convert_attrs(entity_obj.attrs),
        children: [],
      } as GroupWithChildren;
    }

    // } (entity_obj instanceof h5wasm_Dataset) {
    return {
      name: path,
      path,
      kind: EntityKind.Dataset,
      attributes: convert_attrs(entity_obj.attrs),
    } as Dataset;
  }

  public async getValue(
    params: ValuesStoreParams
  ): Promise<H5WasmDataResponse> {
    const { dataset } = params;

    const DTypedArray = typedArrayFromDType(dataset.type);
    if (DTypedArray) {
      const buffer = await this.fetchBinaryData(params);
      const array = new DTypedArray(buffer);
      return hasScalarShape(dataset) ? array[0] : array;
    }

    return this.fetchData(params);
  }

  public async getAttrValues(entity: Entity): Promise<AttributeValues> {
    const { path, attributes } = entity;
    return attributes.length > 0 ? this.fetchAttrValues(path) : {};
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

  private async fetchAttrValues(
    path: string
  ): Promise<H5WasmAttrValuesResponse> {
    const { data } = await this.client.get<H5WasmAttrValuesResponse>(`/attr/`, {
      params: { path },
    });
    return data;
  }

  private async fetchData(
    params: ValuesStoreParams
  ): Promise<H5WasmDataResponse> {
    const { data } = await this.cancellableFetchValue<H5WasmDataResponse>(
      `/data/`,
      params,
      { path: params.dataset.path, selection: params.selection, flatten: true }
    );
    return data;
  }

  private async fetchBinaryData(
    params: ValuesStoreParams
  ): Promise<ArrayBuffer> {
    const { data } = await this.cancellableFetchValue<ArrayBuffer>(
      '/data/',
      params,
      { path: params.dataset.path, selection: params.selection, format: 'bin' },
      'arraybuffer'
    );

    return data;
  }

  private async processEntityResponse(
    path: string,
    response: H5WasmEntityResponse
  ): Promise<Entity> {
    const { name, type: kind } = response;

    const baseEntity = { name, path, kind };

    if (isGroupResponse(response)) {
      const { children, attributes: attrsMetadata } = response;
      const attributes = await this.processAttrsMetadata(path, attrsMetadata);

      if (!children) {
        /* `/meta` stops at one nesting level
         * (i.e. children of child groups are not returned) */
        return { ...baseEntity, attributes } as Group;
      }

      return {
        ...baseEntity,
        attributes,
        // Fetch attribute values of any child groups in parallel
        children: await Promise.all(
          children.map((child) =>
            this.processEntityResponse(buildEntityPath(path, child.name), child)
          )
        ),
      } as GroupWithChildren;
    }

    if (isDatasetResponse(response)) {
      const { attributes: attrsMetadata, dtype, shape } = response;
      const attributes = await this.processAttrsMetadata(path, attrsMetadata);

      return {
        ...baseEntity,
        attributes,
        shape,
        type: convertDtype(dtype),
        rawType: dtype,
      } as Dataset;
    }

    if (isSoftLinkResponse(response)) {
      const { target_path } = response;

      return {
        ...baseEntity,
        attributes: [],
        kind: EntityKind.Unresolved,
        link: { class: 'Soft', path: target_path },
      };
    }

    if (isExternalLinkResponse(response)) {
      const { target_file, target_path } = response;

      return {
        ...baseEntity,
        kind: EntityKind.Unresolved,
        attributes: [],
        link: {
          class: 'External',
          file: target_file,
          path: target_path,
        },
      };
    }

    // Treat 'other' entities as unresolved
    return {
      ...baseEntity,
      kind: EntityKind.Unresolved,
    } as UnresolvedEntity;
  }

  private async processAttrsMetadata(
    path: string,
    attrsMetadata: H5WasmAttribute[]
  ): Promise<Attribute[]> {
    return attrsMetadata.map<Attribute>(({ name, dtype, shape }) => ({
      name,
      shape,
      type: convertDtype(dtype),
    }));
  }
}
