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
  Dataset,
  Datatype,
  Entity,
  EntityKind,
  Group,
  ProviderError,
} from '../models';
import { assertDefined, assertGroup } from '../../guards';
import { GetValueParams, ProviderApi } from '../context';
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
    });
  }

  public async getEntity(path: string): Promise<HsdsEntity> {
    if (this.entities.has(path)) {
      return this.entities.get(path) as HsdsEntity;
    }

    if (path === '/') {
      const rootId = await this.fetchRootId();
      const root = await this.processGroup(rootId, '/', this.filepath, 1);
      this.entities.set(path, root);
      return root;
    }

    /* HSDS doesn't allow fetching entities by path.
       We need to fetch every ascendant group right up to the root group
       in order to find the ID of the entity at the requested path.
       Entities are cached along the way for efficiency. */
    const parentPath = path.slice(0, path.lastIndexOf('/')) || '/';
    const parentGroup = await this.getEntity(parentPath);
    assertGroup(parentGroup);

    const childName = path.slice(path.lastIndexOf('/') + 1);
    const child = getChildEntity(parentGroup, childName);
    assertDefined(child, ProviderError.NotFound);
    assertHsdsEntity(child);

    const entity = isHsdsGroup(child)
      ? await this.processGroup(child.id, path, child.name, 1)
      : child;

    this.entities.set(path, entity);
    return entity;
  }

  public async getValue(params: GetValueParams): Promise<unknown> {
    const { path, selection = '' } = params;

    const entity = await this.getEntity(path);
    assertHsdsDataset(entity);

    return this.fetchValue(entity.id, selection);
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
    selection: string
  ): Promise<unknown> {
    const { data } = await this.cancellableGet<HsdsValueResponse>(
      `/datasets/${entityId}/value${selection && `?select=[${selection}]`}`
    );
    return data.value;
  }

  private async processGroup(
    id: HsdsId,
    path: string,
    name: string,
    depth: number
  ): Promise<HsdsEntity<Group>> {
    const { attributeCount, linkCount } = await this.fetchGroup(id);

    // Fetch attributes and links in parallel
    // If recursion depth has been reached, don't fetch links at all
    const [attributes, links] = await Promise.all([
      attributeCount > 0
        ? this.fetchAttributes('groups', id)
        : Promise.resolve([]),
      linkCount > 0 && depth > 0 ? this.fetchLinks(id) : Promise.resolve([]),
    ]);

    const children = await Promise.all(
      links.map((link) =>
        this.resolveLink(link, buildEntityPath(path, link.title), depth - 1)
      )
    );

    return {
      id,
      path,
      name,
      kind: EntityKind.Group,
      attributes: convertHsdsAttributes(attributes),
      children,
    };
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

  private async resolveLink(
    link: HsdsLink,
    path: string,
    depth: number
  ): Promise<Entity> {
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
        return this.processGroup(id, path, title, depth);
      case 'datasets':
        return this.processDataset(id, path, title);
      case 'datatypes':
        return this.processDatatype(id, path, title);
      default:
        throw new Error('Unknown collection !');
    }
  }
}
