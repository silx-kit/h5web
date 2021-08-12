import type {
  HsdsDatasetResponse,
  HsdsDatatypeResponse,
  HsdsGroupResponse,
  HsdsAttributesResponse,
  HsdsLinksResponse,
  HsdsRootResponse,
  HsdsValueResponse,
  HsdsAttributeResponse,
  HsdsLink,
  HsdsEntity,
  HsdsCollection,
  HsdsId,
} from './models';
import {
  ValuesStoreParams,
  Dataset,
  Datatype,
  Entity,
  EntityKind,
  Group,
  ProviderError,
  GroupWithChildren,
} from '../models';
import {
  assertDefined,
  assertGroupWithChildren,
  hasArrayShape,
} from '../../guards';
import { ProviderApi } from '../api';
import {
  assertHsdsDataset,
  isHsdsGroup,
  convertHsdsShape,
  convertHsdsType,
  convertHsdsAttributes,
  assertHsdsEntity,
} from './utils';
import { buildEntityPath, getChildEntity } from '../../utils';

export class HsdsApi extends ProviderApi {
  private readonly entities = new Map<string, HsdsEntity>();

  /* API compatible with HSDS@6717a7bb8c2245492090be34ec3ccd63ecb20b70 */
  public constructor(
    url: string,
    username: string,
    password: string,
    filepath: string
  ) {
    super(filepath, {
      baseURL: url,
      params: { domain: filepath },
      auth: { username, password },
      transformResponse: (data: unknown) => {
        if (typeof data !== 'string') {
          return data;
        }

        try {
          return JSON.parse(data);
        } catch {
          // https://github.com/HDFGroup/hsds/issues/87
          try {
            return JSON.parse(data.replaceAll(/(NaN|-?Infinity)/gu, '"$&"'));
          } catch {
            return data;
          }
        }
      },
    });
  }

  public async getEntity(path: string): Promise<HsdsEntity> {
    if (this.entities.has(path)) {
      return this.entities.get(path) as HsdsEntity;
    }

    if (path === '/') {
      const rootId = await this.fetchRootId();
      const root = await this.processGroup(rootId, '/', this.filepath);
      this.entities.set(path, root);
      return root;
    }

    /* HSDS doesn't allow fetching entities by path.
       We need to fetch every ascendant group right up to the root group
       in order to find the ID of the entity at the requested path.
       Entities are cached along the way for efficiency. */
    const parentPath = path.slice(0, path.lastIndexOf('/')) || '/';
    const parentGroup = await this.getEntity(parentPath);
    assertGroupWithChildren(parentGroup);

    const childName = path.slice(path.lastIndexOf('/') + 1);
    const child = getChildEntity(parentGroup, childName);
    assertDefined(child, ProviderError.NotFound);
    assertHsdsEntity(child);

    const entity = isHsdsGroup(child)
      ? await this.processGroup(child.id, path, child.name)
      : child;

    this.entities.set(path, entity);
    return entity;
  }

  public async getValue(params: ValuesStoreParams): Promise<unknown> {
    const { path } = params;

    const entity = await this.getEntity(path);
    assertHsdsDataset(entity);

    const value = await this.fetchValue(entity.id, params);

    // https://github.com/HDFGroup/hsds/issues/88
    // HSDS does not reduce the number of dimensions when selecting indices
    // Therefore the flattening must be done on all dimensions regardless of the selection
    if (hasArrayShape(entity)) {
      return (value as unknown[]).flat(entity.shape.length - 1);
    }

    return value;
  }

  private async fetchRootId(): Promise<HsdsId> {
    const { data } = await this.client.get<HsdsRootResponse>('/');
    return data.root;
  }

  private async fetchDataset(id: HsdsId): Promise<HsdsDatasetResponse> {
    const { data } = await this.client.get<HsdsDatasetResponse>(
      `/datasets/${id}`
    );
    return data;
  }

  private async fetchDatatype(id: HsdsId): Promise<HsdsDatatypeResponse> {
    const { data } = await this.client.get<HsdsDatatypeResponse>(
      `/datatypes/${id}`
    );
    return data;
  }

  private async fetchGroup(id: HsdsId): Promise<HsdsGroupResponse> {
    const { data } = await this.client.get<HsdsGroupResponse>(`/groups/${id}`);
    return data;
  }

  private async fetchLinks(id: HsdsId): Promise<HsdsLink[]> {
    const { data } = await this.client.get<HsdsLinksResponse>(
      `/groups/${id}/links`
    );
    return data.links;
  }

  private async fetchAttributes(
    entityCollection: HsdsCollection,
    entityId: HsdsId
  ): Promise<HsdsAttributeResponse[]> {
    const { data } = await this.client.get<HsdsAttributesResponse>(
      `/${entityCollection}/${entityId}/attributes`
    );

    const attrsPromises = data.attributes.map(async (attr) => {
      const { data } = await this.client.get<HsdsAttributeResponse>(
        `/${entityCollection}/${entityId}/attributes/${attr.name}`
      );
      return data;
    });

    return Promise.all(attrsPromises);
  }

  private async fetchValue(
    entityId: HsdsId,
    params: ValuesStoreParams
  ): Promise<unknown> {
    const { selection } = params;
    const { data } = await this.cancellableFetchValue<HsdsValueResponse>(
      `/datasets/${entityId}/value`,
      params,
      { select: selection && `[${selection}]` }
    );
    return data.value;
  }

  private async processGroup(
    id: HsdsId,
    path: string,
    name: string,
    isChild = false
  ): Promise<HsdsEntity<Group>> {
    const { attributeCount, linkCount } = await this.fetchGroup(id);

    // Fetch attributes and links in parallel
    const [attributes, links] = await Promise.all([
      attributeCount > 0
        ? this.fetchAttributes('groups', id)
        : Promise.resolve([]),
      linkCount > 0 && !isChild ? this.fetchLinks(id) : Promise.resolve([]),
    ]);

    const group: HsdsEntity<Group> = {
      id,
      path,
      name,
      kind: EntityKind.Group,
      attributes: convertHsdsAttributes(attributes),
    };

    if (isChild) {
      return group; // don't fetch nested group's children
    }

    return {
      ...group,
      children: await Promise.all(
        links.map((link) =>
          this.resolveLink(link, buildEntityPath(path, link.title))
        )
      ),
    } as HsdsEntity<GroupWithChildren>;
  }

  private async processDataset(
    id: HsdsId,
    path: string,
    name: string
  ): Promise<HsdsEntity<Dataset>> {
    const dataset = await this.fetchDataset(id);
    const { shape, type, attributeCount } = dataset;

    const attributes =
      attributeCount > 0 ? await this.fetchAttributes('datasets', id) : [];

    return {
      id,
      path,
      name,
      kind: EntityKind.Dataset,
      attributes: convertHsdsAttributes(attributes),
      shape: convertHsdsShape(shape),
      type: convertHsdsType(type),
      rawType: type,
    };
  }

  private async processDatatype(
    id: HsdsId,
    path: string,
    name: string
  ): Promise<Datatype> {
    const { type } = await this.fetchDatatype(id);

    return {
      path,
      name,
      kind: EntityKind.Datatype,
      attributes: [],
      type: convertHsdsType(type),
      rawType: type,
    };
  }

  private async resolveLink(link: HsdsLink, path: string): Promise<Entity> {
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

    switch (collection) {
      case 'groups':
        return this.processGroup(id, path, title, true);
      case 'datasets':
        return this.processDataset(id, path, title);
      case 'datatypes':
        return this.processDatatype(id, path, title);
      default:
        throw new Error('Unknown collection !');
    }
  }
}
