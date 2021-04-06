import axios, { AxiosInstance } from 'axios';
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
  HsdsComplex,
  HsdsEntity,
} from './models';
import { Dataset, Datatype, Entity, EntityKind, Group } from '../models';
import { HDF5Collection, HDF5Id, HDF5Value, HDF5Link } from '../hdf5-models';
import {
  assertDefined,
  assertGroup,
  hasComplexType,
  isHardLink,
} from '../../guards';
import type { GetValueParams, ProviderAPI } from '../context';
import {
  assertHsdsDataset,
  isHsdsExternalLink,
  isHsdsGroup,
  convertHsdsShape,
  convertHsdsType,
  parseComplex,
  convertHsdsAttributes,
  assertHsdsEntity,
} from './utils';
import { buildEntityPath, getChildEntity } from '../../utils';

export class HsdsApi implements ProviderAPI {
  public readonly filepath: string;
  private readonly client: AxiosInstance;

  private readonly entities = new Map<string, HsdsEntity>();

  public constructor(
    url: string,
    username: string,
    password: string,
    filepath: string
  ) {
    this.filepath = filepath;
    this.client = axios.create({
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
    assertDefined(child);
    assertHsdsEntity(child);

    const entity = isHsdsGroup(child)
      ? await this.processGroup(child.id, path, child.name, 1)
      : child;

    this.entities.set(path, entity);
    return entity;
  }

  public async getValue(params: GetValueParams): Promise<HDF5Value> {
    const { path, selection = '' } = params;

    const entity = await this.getEntity(path);
    assertHsdsDataset(entity);

    const { data } = await this.client.get<HsdsValueResponse>(
      `/datasets/${entity.id}/value${selection && `?select=[${selection}]`}`
    );

    if (hasComplexType(entity)) {
      return parseComplex(data.value as HsdsComplex);
    }

    return data.value;
  }

  private async fetchRootId(): Promise<HDF5Id> {
    const { data } = await this.client.get<HsdsRootResponse>('/');
    return data.root;
  }

  private async fetchDataset(id: HDF5Id): Promise<HsdsDatasetResponse> {
    const { data } = await this.client.get<HsdsDatasetResponse>(
      `/datasets/${id}`
    );
    return data;
  }

  private async fetchDatatype(id: HDF5Id): Promise<HsdsDatatypeResponse> {
    const { data } = await this.client.get<HsdsDatatypeResponse>(
      `/datatypes/${id}`
    );
    return data;
  }

  private async fetchGroup(id: HDF5Id): Promise<HsdsGroupResponse> {
    const { data } = await this.client.get<HsdsGroupResponse>(`/groups/${id}`);
    return data;
  }

  private async fetchLinks(id: HDF5Id): Promise<HsdsLink[]> {
    const { data } = await this.client.get<HsdsLinksResponse>(
      `/groups/${id}/links`
    );
    return data.links;
  }

  private async fetchAttributes(
    entityCollection: HDF5Collection,
    entityId: HDF5Id
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

  private async processGroup(
    id: HDF5Id,
    path: string,
    name: string,
    depth: number
  ): Promise<HsdsEntity<Group>> {
    const { attributeCount, linkCount } = await this.fetchGroup(id);

    // Fetch attributes and links in parallel
    // If recursion depth has been reached, don't fetch links at all
    const [attributes, links] = await Promise.all([
      attributeCount > 0
        ? this.fetchAttributes(HDF5Collection.Groups, id)
        : Promise.resolve([]),
      linkCount > 0 && depth > 0 ? this.fetchLinks(id) : Promise.resolve([]),
    ]);

    const children = await Promise.all(
      links
        .map<HDF5Link>((link: HsdsLink) =>
          isHsdsExternalLink(link) ? { ...link, file: link.h5domain } : link
        )
        .map((link) =>
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
    id: HDF5Id,
    path: string,
    name: string
  ): Promise<HsdsEntity<Dataset>> {
    const dataset = await this.fetchDataset(id);
    const { shape, type, attributeCount } = dataset;

    const attributes =
      attributeCount > 0
        ? await this.fetchAttributes(HDF5Collection.Datasets, id)
        : [];

    return {
      id,
      path,
      name,
      kind: EntityKind.Dataset,
      attributes: convertHsdsAttributes(attributes),
      shape: convertHsdsShape(shape),
      type: convertHsdsType(type),
    };
  }

  private async processDatatype(
    id: HDF5Id,
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
    };
  }

  private async resolveLink(
    link: HDF5Link,
    path: string,
    depth: number
  ): Promise<Entity> {
    if (!isHardLink(link)) {
      return {
        name: link.title,
        path,
        kind: EntityKind.Link,
        attributes: [],
        rawLink: link,
      };
    }

    const { id, title, collection } = link;

    switch (collection) {
      case HDF5Collection.Groups:
        return this.processGroup(id, path, title, depth);
      case HDF5Collection.Datasets:
        return this.processDataset(id, path, title);
      case HDF5Collection.Datatypes:
        return this.processDatatype(id, path, title);
      default:
        throw new Error('Unknown collection !');
    }
  }
}
