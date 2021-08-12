import {
  ValuesStoreParams,
  Dataset,
  Entity,
  EntityKind,
  GroupWithChildren,
  Attribute,
  Group,
  UnresolvedEntity,
} from '../models';
import { ProviderApi } from '../api';
import { isDatasetResponse, isGroupResponse } from './utils';
import type {
  JupyterAttrValuesResponse,
  JupyterDataResponse,
  JupyterEntityResponse,
  JupyterAttribute,
} from './models';
import { assertDataset } from '../../guards';
import { convertDtype, flattenValue } from '../utils';
import { buildEntityPath } from '../../utils';

export class JupyterStableApi extends ProviderApi {
  protected attrValuesCache = new Map<string, JupyterAttrValuesResponse>();

  /* API compatible with jupyterlab_hdf v0.6.0 */
  public constructor(url: string, filepath: string) {
    super(filepath, { baseURL: `${url}/hdf` });
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

  protected async fetchEntity(path: string): Promise<JupyterEntityResponse> {
    const { data } = await this.client.get<JupyterEntityResponse>(
      `/meta/${this.filepath}`,
      { params: { uri: path } }
    );
    return data;
  }

  protected async fetchAttrValues(
    path: string
  ): Promise<JupyterAttrValuesResponse> {
    /* Prevent attribute values from being fetched twice for the same entity,
     * when processing the entity's parent group and then the entity itself. */
    const cachedValues = this.attrValuesCache.get(path);
    if (cachedValues) {
      return cachedValues;
    }

    const { data } = await this.client.get<JupyterAttrValuesResponse>(
      `/attrs/${this.filepath}`,
      { params: { uri: path } }
    );

    this.attrValuesCache.set(path, data);
    return data;
  }

  protected async fetchData(
    params: ValuesStoreParams
  ): Promise<JupyterDataResponse> {
    const { path, selection } = params;
    const { data } = await this.cancellableFetchValue<JupyterDataResponse>(
      `/data/${this.filepath}`,
      params,
      { uri: path, ixstr: selection }
    );
    return data;
  }

  protected async processEntityResponse(
    path: string,
    response: JupyterEntityResponse
  ): Promise<Entity> {
    const { name, type: kind, attributes: attrsMetadata } = response;

    const attributes = await this.processAttrsMetadata(path, attrsMetadata);
    const baseEntity = { name, path, kind, attributes };

    if (isGroupResponse(response)) {
      const { children } = response;

      if (!children) {
        /* `/hdf/meta` stops at one nesting level
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

  protected async processAttrsMetadata(
    path: string,
    attrsMetadata: JupyterAttribute[]
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
