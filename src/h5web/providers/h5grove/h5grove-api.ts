import {
  ValuesStoreParams,
  Dataset,
  Entity,
  EntityKind,
  GroupWithChildren,
  Attribute,
  Group,
  UnresolvedEntity,
  ProviderError,
} from '../models';
import { ProviderApi } from '../api';
import { isDatasetResponse, isGroupResponse } from './utils';
import type {
  H5GroveAttrValuesResponse,
  H5GroveDataResponse,
  H5GroveEntityResponse,
  H5GroveAttribute,
} from './models';
import { assertDataset } from '../../guards';
import { convertDtype, flattenValue, handleAxiosError } from '../utils';
import { buildEntityPath } from '../../utils';

export class H5GroveApi extends ProviderApi {
  protected attrValuesCache = new Map<string, H5GroveAttrValuesResponse>();

  /* API compatible with h5grove@0.0.4 */
  public constructor(url: string, filepath: string) {
    super(filepath, { baseURL: url, params: { file: filepath } });
  }

  public async getEntity(path: string): Promise<Entity> {
    const response = await this.fetchEntity(path);
    return this.processEntityResponse(path, response);
  }

  public async getValue(params: ValuesStoreParams): Promise<unknown> {
    const { path, selection } = params;
    const [value, entity] = await Promise.all([
      this.fetchData(params),
      this.getEntity(path),
    ]);

    assertDataset(entity);

    return flattenValue(value, entity, selection);
  }

  private async fetchEntity(path: string): Promise<H5GroveEntityResponse> {
    const { data } = await handleAxiosError(
      () =>
        this.client.get<H5GroveEntityResponse>(`/meta/`, { params: { path } }),
      404,
      ProviderError.NotFound
    );
    return data;
  }

  private async fetchAttrValues(
    path: string
  ): Promise<H5GroveAttrValuesResponse> {
    /* Prevent attribute values from being fetched twice for the same entity,
     * when processing the entity's parent group and then the entity itself. */
    const cachedValues = this.attrValuesCache.get(path);
    if (cachedValues) {
      return cachedValues;
    }

    const { data } = await this.client.get<H5GroveAttrValuesResponse>(
      `/attr/`,
      { params: { path } }
    );

    this.attrValuesCache.set(path, data);
    return data;
  }

  private async fetchData(
    params: ValuesStoreParams
  ): Promise<H5GroveDataResponse> {
    const { data } = await this.cancellableFetchValue<H5GroveDataResponse>(
      `/data/`,
      params
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
    if (attrsMetadata.length === 0) {
      return [];
    }

    const attrValues = await this.fetchAttrValues(path);

    return attrsMetadata.map<Attribute>(({ name, dtype, shape }) => ({
      name,
      shape,
      type: convertDtype(dtype),
      value: attrValues[name],
    }));
  }
}
