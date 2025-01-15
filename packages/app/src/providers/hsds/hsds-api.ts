import {
  assertDefined,
  assertGroup,
  hasArrayShape,
} from '@h5web/shared/guards';
import {
  type ArrayShape,
  type AttributeValues,
  type ChildEntity,
  type Dataset,
  type Datatype,
  type Entity,
  EntityKind,
  type Group,
  type GroupWithChildren,
  type ProvidedEntity,
  type Value,
} from '@h5web/shared/hdf5-models';
import { buildEntityPath, getChildEntity } from '@h5web/shared/hdf5-utils';
import { type OnProgress } from '@h5web/shared/react-suspense-fetch';
import axios, { AxiosError, type AxiosInstance } from 'axios';

import { DataProviderApi } from '../api';
import {
  type ExportFormat,
  type ExportURL,
  type ValuesStoreParams,
} from '../models';
import { createAxiosProgressHandler } from '../utils';
import {
  type BaseHsdsEntity,
  type HsdsAttribute,
  type HsdsAttributesResponse,
  type HsdsAttributeWithValueResponse,
  type HsdsCollection,
  type HsdsDatasetResponse,
  type HsdsDatatypeResponse,
  type HsdsEntity,
  type HsdsGroupResponse,
  type HsdsId,
  type HsdsLink,
  type HsdsLinksResponse,
  type HsdsRootResponse,
  type HsdsValueResponse,
} from './models';
import {
  assertHsdsDataset,
  assertHsdsEntity,
  convertHsdsAttributes,
  convertHsdsShape,
  convertHsdsType,
  flattenValue,
  isHsdsGroup,
} from './utils';

export class HsdsApi extends DataProviderApi {
  private readonly entities = new Map<string, HsdsEntity<ProvidedEntity>>();
  private readonly client: AxiosInstance;

  /* API compatible with HSDS@6717a7bb8c2245492090be34ec3ccd63ecb20b70 */
  public constructor(
    url: string,
    username: string,
    password: string,
    filepath: string,
    private readonly _getExportURL?: DataProviderApi['getExportURL'],
  ) {
    super(filepath);

    this.client = axios.create({
      adapter: 'fetch',
      baseURL: url,
      params: { domain: filepath },
      auth: { username, password },
      transformResponse: (data: unknown) => {
        if (typeof data !== 'string') {
          return data;
        }

        try {
          return JSON.parse(data) as unknown;
        } catch {
          // https://github.com/HDFGroup/hsds/issues/87
          try {
            return JSON.parse(
              data.replaceAll(/-?Infinity|NaN/gu, '"$&"'),
            ) as unknown;
          } catch {
            return data;
          }
        }
      },
    });
  }

  public override async getEntity(
    path: string,
  ): Promise<HsdsEntity<ProvidedEntity>> {
    const cachedEntity = this.entities.get(path);
    if (cachedEntity) {
      return cachedEntity;
    }

    if (path === '/') {
      const rootId = await this.fetchRootId();
      const root = await this.processGroup({
        id: rootId,
        collection: 'groups',
        path: '/',
        name: this.filepath,
      });

      this.entities.set(path, root);
      return root;
    }

    /* HSDS doesn't allow fetching entities by path.
     * We need to fetch every ascendant group right up to the root group
     * in order to find the ID of the entity at the requested path.
     * Entities are cached along the way for efficiency. */
    const parentPath = path.slice(0, path.lastIndexOf('/')) || '/';
    const parentGroup = await this.getEntity(parentPath);
    assertGroup(parentGroup);

    const childName = path.slice(path.lastIndexOf('/') + 1);
    const child = getChildEntity(parentGroup, childName);
    assertDefined(child, `No entity found at ${path}`);
    assertHsdsEntity(child);

    const entity = isHsdsGroup(child)
      ? await this.processGroup({ ...child, path })
      : child;

    this.entities.set(path, entity);
    return entity;
  }

  public override async getValue(
    params: ValuesStoreParams,
    signal?: AbortSignal,
    onProgress?: OnProgress,
  ): Promise<unknown> {
    const { dataset } = params;
    assertHsdsDataset(dataset);

    const value = await this.fetchValue(dataset.id, params, signal, onProgress);

    /* HSDS doesn't reduce the number of dimensions when selecting indices,
     * so the flattening must be done on all dimensions regardless of the selection.
     * https://github.com/HDFGroup/hsds/issues/88 */
    return hasArrayShape(dataset) ? flattenValue(value, dataset) : value;
  }

  public override async getAttrValues(
    entity: Entity,
  ): Promise<AttributeValues> {
    assertHsdsEntity(entity);

    const { id, collection, attributes } = entity;
    if (attributes.length === 0) {
      return {};
    }

    const attrsPromises = attributes.map(async (attr) =>
      this.fetchAttributeWithValue(collection, id, attr.name),
    );

    const attrsWithValues = await Promise.all(attrsPromises);
    return Object.fromEntries(
      attrsWithValues.map((attr) => [attr.name, attr.value]),
    );
  }

  public override getExportURL<D extends Dataset<ArrayShape>>(
    format: ExportFormat,
    dataset: D,
    selection: string | undefined,
    value: Value<D>,
  ): ExportURL {
    return this._getExportURL?.(format, dataset, selection, value);
  }

  private async fetchRootId(): Promise<HsdsId> {
    try {
      const { data } = await this.client.get<HsdsRootResponse>('/');
      return data.root;
    } catch (error) {
      if (error instanceof AxiosError && error.status === 400) {
        throw new Error(`File not found: ${this.filepath}`, { cause: error });
      }

      throw error;
    }
  }

  private async fetchDataset(id: HsdsId): Promise<HsdsDatasetResponse> {
    const { data } = await this.client.get<HsdsDatasetResponse>(
      `/datasets/${id}`,
    );
    return data;
  }

  private async fetchDatatype(id: HsdsId): Promise<HsdsDatatypeResponse> {
    const { data } = await this.client.get<HsdsDatatypeResponse>(
      `/datatypes/${id}`,
    );
    return data;
  }

  private async fetchGroup(id: HsdsId): Promise<HsdsGroupResponse> {
    const { data } = await this.client.get<HsdsGroupResponse>(`/groups/${id}`);
    return data;
  }

  private async fetchLinks(id: HsdsId): Promise<HsdsLink[]> {
    const { data } = await this.client.get<HsdsLinksResponse>(
      `/groups/${id}/links`,
    );
    return data.links;
  }

  private async fetchAttributes(
    entityCollection: HsdsCollection,
    entityId: HsdsId,
  ): Promise<HsdsAttribute[]> {
    const { data } = await this.client.get<HsdsAttributesResponse>(
      `/${entityCollection}/${entityId}/attributes`,
    );
    return data.attributes;
  }

  private async fetchValue(
    entityId: HsdsId,
    params: ValuesStoreParams,
    signal?: AbortSignal,
    onProgress?: OnProgress,
  ): Promise<unknown> {
    const { selection } = params;

    try {
      const { data } = await this.client.get<HsdsValueResponse>(
        `/datasets/${entityId}/value`,
        {
          params: { select: selection ? `[${selection}]` : undefined },
          signal,
          onDownloadProgress: createAxiosProgressHandler(onProgress),
        },
      );

      return data.value;
    } catch (error) {
      if (error instanceof AxiosError && axios.isCancel(error)) {
        // Throw abort reason instead of axios `CancelError`
        // https://github.com/axios/axios/issues/5758
        throw new Error(
          typeof signal?.reason === 'string' ? signal.reason : 'cancelled',
          { cause: error },
        );
      }

      throw error;
    }
  }

  private async fetchAttributeWithValue(
    entityCollection: HsdsCollection,
    entityId: HsdsId,
    attributeName: string,
  ): Promise<HsdsAttributeWithValueResponse> {
    const { data } = await this.client.get<HsdsAttributeWithValueResponse>(
      `/${entityCollection}/${entityId}/attributes/${attributeName}`,
    );
    return data;
  }

  private async resolveLink(
    link: HsdsLink,
    path: string,
  ): Promise<ChildEntity> {
    if (link.class !== 'H5L_TYPE_HARD') {
      return {
        name: link.title,
        path,
        kind: EntityKind.Unresolved,
        attributes: [],
        link: {
          class: link.class === 'H5L_TYPE_SOFT' ? 'Soft' : 'External',
          path: link.h5path,
          file: link.file,
        },
      };
    }

    const { id, title, collection } = link;
    const baseEntity: BaseHsdsEntity = { id, collection, path, name: title };

    switch (collection) {
      case 'groups':
        return this.processGroup(baseEntity, true);
      case 'datasets':
        return this.processDataset(baseEntity);
      case 'datatypes':
        return this.processDatatype(baseEntity);
      default:
        throw new Error('Unknown collection !');
    }
  }

  private async processGroup(
    baseEntity: BaseHsdsEntity,
    isChild: true,
  ): Promise<HsdsEntity<Group>>;

  private async processGroup(
    baseEntity: BaseHsdsEntity,
    isChild?: false,
  ): Promise<HsdsEntity<GroupWithChildren>>;

  private async processGroup(
    baseEntity: BaseHsdsEntity,
    isChild = false,
  ): Promise<HsdsEntity<Group | GroupWithChildren>> {
    const { id, path } = baseEntity;
    const { attributeCount, linkCount } = await this.fetchGroup(id);

    // Fetch attributes and links in parallel
    const [attributes, links] = await Promise.all([
      attributeCount > 0
        ? this.fetchAttributes('groups', id)
        : Promise.resolve([]),
      linkCount > 0 && !isChild ? this.fetchLinks(id) : Promise.resolve([]),
    ]);

    const group: HsdsEntity<Group> = {
      ...baseEntity,
      kind: EntityKind.Group,
      attributes: convertHsdsAttributes(attributes),
    };

    if (isChild) {
      return group; // don't fetch nested group's children
    }

    return {
      ...group,
      children: await Promise.all(
        links.map(async (link) =>
          this.resolveLink(link, buildEntityPath(path, link.title)),
        ),
      ),
    };
  }

  private async processDataset(
    baseEntity: BaseHsdsEntity,
  ): Promise<HsdsEntity<Dataset>> {
    const { id } = baseEntity;
    const dataset = await this.fetchDataset(id);
    const { shape, type, attributeCount } = dataset;

    const attributes =
      attributeCount > 0 ? await this.fetchAttributes('datasets', id) : [];

    return {
      ...baseEntity,
      kind: EntityKind.Dataset,
      attributes: convertHsdsAttributes(attributes),
      shape: convertHsdsShape(shape),
      type: convertHsdsType(type),
      rawType: type,
    };
  }

  private async processDatatype(
    baseEntity: BaseHsdsEntity,
  ): Promise<HsdsEntity<Datatype>> {
    const { id } = baseEntity;
    const { type } = await this.fetchDatatype(id);

    return {
      ...baseEntity,
      kind: EntityKind.Datatype,
      attributes: [],
      type: convertHsdsType(type),
      rawType: type,
    };
  }
}
