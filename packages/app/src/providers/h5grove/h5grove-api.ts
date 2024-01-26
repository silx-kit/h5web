import { hasNumericType, hasScalarShape } from '@h5web/shared/guards';
import type {
  ArrayShape,
  Attribute,
  AttributeValues,
  ChildEntity,
  Dataset,
  Entity,
  Group,
  ProvidedEntity,
  Value,
} from '@h5web/shared/hdf5-models';
import { EntityKind } from '@h5web/shared/hdf5-models';
import { buildEntityPath } from '@h5web/shared/hdf5-utils';
import type { AxiosRequestConfig } from 'axios';

import { DataProviderApi } from '../api';
import type { ExportFormat, ExportURL, ValuesStoreParams } from '../models';
import { handleAxiosError, typedArrayFromDType } from '../utils';
import type {
  H5GroveAttribute,
  H5GroveAttrValuesResponse,
  H5GroveDataResponse,
  H5GroveEntity,
  H5GroveEntityResponse,
  H5GrovePathsResponse,
} from './models';
import { hasErrorMessage, parseDType } from './utils';

export class H5GroveApi extends DataProviderApi {
  /* API compatible with h5grove@1.3.0 */
  public constructor(
    url: string,
    filepath: string,
    axiosConfig?: AxiosRequestConfig,
    private readonly _getExportURL?: DataProviderApi['getExportURL'],
  ) {
    super(filepath, { baseURL: url, ...axiosConfig });
  }

  public async getEntity(path: string): Promise<ProvidedEntity> {
    const response = await this.fetchEntity(path);
    return this.parseEntity(path, response);
  }

  public async getValue(
    params: ValuesStoreParams,
  ): Promise<H5GroveDataResponse> {
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

    if (format !== 'json' && !hasNumericType(dataset)) {
      return undefined;
    }

    const { baseURL, params } = this.client.defaults;

    const searchParams = new URLSearchParams(params as Record<string, string>);
    searchParams.set('path', dataset.path);
    searchParams.set('format', format);

    if (selection) {
      searchParams.set('selection', selection);
    }

    return new URL(`${baseURL as string}/data/?${searchParams.toString()}`);
  }

  public override async getSearchablePaths(path: string): Promise<string[]> {
    const { data } = await this.client.get<H5GrovePathsResponse>(`/paths/`, {
      params: { path },
    });

    return data;
  }

  private async fetchEntity(path: string): Promise<H5GroveEntityResponse> {
    const { data } = await handleAxiosError(
      () =>
        this.client.get<H5GroveEntityResponse>(`/meta/`, { params: { path } }),
      (_, errorData) => {
        if (!hasErrorMessage(errorData)) {
          return undefined;
        }
        const { message } = errorData;

        if (message.includes('File not found')) {
          return `File not found: '${this.filepath}'`;
        }
        if (message.includes('Permission denied')) {
          return `Cannot read file '${this.filepath}': Permission denied`;
        }
        if (message.includes('not a valid path')) {
          return `No entity found at ${path}`;
        }
        if (message.includes('Cannot resolve')) {
          return `Could not resolve soft link at ${path}`;
        }

        return undefined;
      },
    );
    return data;
  }

  private async fetchAttrValues(
    path: string,
  ): Promise<H5GroveAttrValuesResponse> {
    const { data } = await this.client.get<H5GroveAttrValuesResponse>(
      `/attr/`,
      { params: { path } },
    );
    return data;
  }

  private async fetchData(
    params: ValuesStoreParams,
  ): Promise<H5GroveDataResponse> {
    const { data } = await this.cancellableFetchValue(`/data/`, params, {
      path: params.dataset.path,
      selection: params.selection,
      flatten: true,
    });

    return data;
  }

  private async fetchBinaryData(
    params: ValuesStoreParams,
  ): Promise<ArrayBuffer> {
    const { data } = await this.cancellableFetchValue(
      '/data/',
      params,
      {
        path: params.dataset.path,
        selection: params.selection,
        format: 'bin',
        dtype: 'safe',
      },
      'arraybuffer',
    );

    return data;
  }

  private parseEntity(
    path: string,
    h5gEntity: H5GroveEntity,
    isChild: true,
  ): ChildEntity;

  private parseEntity(
    path: string,
    h5gEntity: H5GroveEntity,
    isChild?: false,
  ): ProvidedEntity;

  private parseEntity(
    path: string,
    h5gEntity: H5GroveEntity,
    isChild = false,
  ): ProvidedEntity | ChildEntity {
    const { name } = h5gEntity;
    const baseEntity = { name, path };

    if (h5gEntity.type === EntityKind.Group) {
      const { children = [], attributes: attrsMetadata } = h5gEntity;
      const attributes = this.parseAttributes(attrsMetadata);
      const baseGroup: Group = {
        ...baseEntity,
        kind: EntityKind.Group,
        attributes,
      };

      if (isChild) {
        return baseGroup;
      }

      return {
        ...baseGroup,
        children: children.map((child) => {
          const childPath = buildEntityPath(path, child.name);
          return this.parseEntity(childPath, child, true);
        }),
      };
    }

    if (h5gEntity.type === EntityKind.Dataset) {
      const {
        attributes: attrsMetadata,
        dtype,
        shape,
        chunks,
        filters,
      } = h5gEntity;
      const attributes = this.parseAttributes(attrsMetadata);
      return {
        ...baseEntity,
        attributes,
        kind: EntityKind.Dataset,
        shape,
        type: parseDType(dtype),
        rawType: dtype,
        ...(chunks && { chunks }),
        ...(filters && { filters }),
      };
    }

    if (h5gEntity.type === 'soft_link') {
      const { target_path } = h5gEntity;
      return {
        ...baseEntity,
        attributes: [],
        kind: EntityKind.Unresolved,
        link: { class: 'Soft', path: target_path },
      };
    }

    if (h5gEntity.type === 'external_link') {
      const { target_file, target_path } = h5gEntity;
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

    // Treat other entities as unresolved
    return {
      ...baseEntity,
      attributes: [],
      kind: EntityKind.Unresolved,
    };
  }

  private parseAttributes(attrsMetadata: H5GroveAttribute[]): Attribute[] {
    return attrsMetadata.map<Attribute>(({ name, dtype, shape }) => ({
      name,
      shape,
      type: parseDType(dtype),
    }));
  }
}
