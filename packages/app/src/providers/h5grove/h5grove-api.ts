import type {
  Attribute,
  AttributeValues,
  Dataset,
  Entity,
  Group,
  GroupWithChildren,
  UnresolvedEntity,
} from '@h5web/shared';
import {
  hasScalarShape,
  hasArrayShape,
  buildEntityPath,
  EntityKind,
} from '@h5web/shared';
import { isString } from 'lodash';

import { ProviderApi } from '../api';
import type { ValuesStoreParams } from '../models';
import { convertDtype, flattenValue, handleAxiosError } from '../utils';
import type {
  H5GroveAttribute,
  H5GroveAttrValuesResponse,
  H5GroveDataResponse,
  H5GroveEntityResponse,
} from './models';
import {
  isDatasetResponse,
  isGroupResponse,
  typedArrayFromDType,
} from './utils';

export class H5GroveApi extends ProviderApi {
  /* API compatible with h5grove@0.0.9 */
  public constructor(
    url: string,
    filepath: string,
    axiosParams?: Record<string, string>
  ) {
    super(filepath, {
      baseURL: url,
      params: axiosParams,
    });
  }

  public async getEntity(path: string): Promise<Entity> {
    const response = await this.fetchEntity(path);
    return this.processEntityResponse(path, response);
  }

  public async getValue(
    params: ValuesStoreParams
  ): Promise<H5GroveDataResponse> {
    const { dataset, selection } = params;

    const DTypedArray = typedArrayFromDType(dataset.type);
    if (DTypedArray) {
      const buffer = await this.fetchBinaryData(params);
      const array = new DTypedArray(buffer);
      return hasScalarShape(dataset) ? array[0] : [...array];
    }

    const value = await this.fetchData(params);
    return hasArrayShape(dataset)
      ? flattenValue(value, dataset, selection)
      : value;
  }

  public async getAttrValues(entity: Entity): Promise<AttributeValues> {
    const { path, attributes } = entity;
    return attributes.length > 0 ? this.fetchAttrValues(path) : {};
  }

  private async fetchEntity(path: string): Promise<H5GroveEntityResponse> {
    const { data } = await handleAxiosError(
      () =>
        this.client.get<H5GroveEntityResponse>(`/meta/`, { params: { path } }),
      (status, errorData) => {
        if (status !== 404 || !isString(errorData)) {
          return undefined;
        }

        if (errorData.includes('File not found')) {
          return `File not found: '${this.filepath}'`;
        }
        if (errorData.includes('not a valid path')) {
          return `No entity found at ${path}`;
        }
        if (errorData.includes('Cannot resolve')) {
          return `Could not resolve soft link at ${path}`;
        }

        return undefined;
      }
    );
    return data;
  }

  private async fetchAttrValues(
    path: string
  ): Promise<H5GroveAttrValuesResponse> {
    const { data } = await this.client.get<H5GroveAttrValuesResponse>(
      `/attr/`,
      { params: { path } }
    );
    return data;
  }

  private async fetchData(
    params: ValuesStoreParams
  ): Promise<H5GroveDataResponse> {
    const { data } = await this.cancellableFetchValue<H5GroveDataResponse>(
      `/data/`,
      params,
      { path: params.dataset.path, selection: params.selection }
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
    response: H5GroveEntityResponse
  ): Promise<Entity> {
    const { name, type: kind, attributes: attrsMetadata } = response;

    const attributes = await this.processAttrsMetadata(path, attrsMetadata);
    const baseEntity = { name, path, kind, attributes };

    if (isGroupResponse(response)) {
      const { children } = response;

      if (!children) {
        /* `/meta` stops at one nesting level
         * (i.e. children of child groups are not returned) */
        return baseEntity as Group;
      }

      return {
        ...baseEntity,
        // Fetch attribute values of any child groups in parallel
        children: await Promise.all(
          children.map((child) =>
            this.processEntityResponse(buildEntityPath(path, child.name), child)
          )
        ),
      } as GroupWithChildren;
    }

    if (isDatasetResponse(response)) {
      const { dtype, shape } = response;

      return {
        ...baseEntity,
        shape,
        type: convertDtype(dtype),
        rawType: dtype,
      } as Dataset;
    }

    // Treat 'other' entities as unresolved
    return {
      ...baseEntity,
      kind: EntityKind.Unresolved,
    } as UnresolvedEntity;
  }

  private async processAttrsMetadata(
    path: string,
    attrsMetadata: H5GroveAttribute[]
  ): Promise<Attribute[]> {
    return attrsMetadata.map<Attribute>(({ name, dtype, shape }) => ({
      name,
      shape,
      type: convertDtype(dtype),
    }));
  }
}
