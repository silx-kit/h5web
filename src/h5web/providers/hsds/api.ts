import axios, { AxiosInstance } from 'axios';
import type {
  HsdsDatasetResponse,
  HsdsDatatypeResponse,
  HsdsGroupResponse,
  HsdsAttributesResponse,
  HsdsLinksResponse,
  HsdsRootResponse,
  HsdsValueResponse,
  HsdsAttributeWithValueResponse,
  HsdsLink,
  HsdsGroup,
  HsdsDataset,
} from './models';
import { Datatype, Entity, EntityKind } from '../models';
import {
  HDF5Collection,
  HDF5Id,
  HDF5Value,
  HDF5Attribute,
  HDF5Link,
} from '../hdf5-models';
import { assertDefined, assertGroup, isHardLink } from '../../guards';
import type { ProviderAPI } from '../context';
import { assertHsdsDataset, isHsdsExternalLink, isHsdsGroup } from './utils';
import { nanoid } from 'nanoid';
import { buildEntityPath, getChildEntity } from '../../utils';

export class HsdsApi implements ProviderAPI {
  public readonly domain: string;
  private readonly client: AxiosInstance;

  private readonly entities = new Map<string, Entity>();

  public constructor(
    url: string,
    username: string,
    password: string,
    domain: string
  ) {
    this.domain = domain;
    this.client = axios.create({
      baseURL: url,
      params: { domain },
      auth: { username, password },
    });
  }

  public async getEntity(path: string): Promise<Entity> {
    if (this.entities.has(path)) {
      return this.entities.get(path) as Entity;
    }

    if (path === '/') {
      const rootId = await this.fetchRootId();
      const root = await this.processGroup(rootId, '/', this.domain, 1);
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

    const entity = isHsdsGroup(child)
      ? await this.processGroup(child.id, path, child.name, 1)
      : child;

    this.entities.set(path, entity);
    return entity;
  }

  public async getValue(path: string): Promise<HDF5Value> {
    const entity = await this.getEntity(path);
    assertHsdsDataset(entity);

    const { data } = await this.client.get<HsdsValueResponse>(
      `/datasets/${entity.id}/value`
    );
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
  ): Promise<HDF5Attribute[]> {
    const { data } = await this.client.get<HsdsAttributesResponse>(
      `/${entityCollection}/${entityId}/attributes`
    );

    const attrsPromises = data.attributes.map(async (attr) => {
      const { data } = await this.client.get<HsdsAttributeWithValueResponse>(
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
  ): Promise<HsdsGroup> {
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
      uid: nanoid(),
      id,
      path,
      name,
      kind: EntityKind.Group,
      attributes,
      children,
    };
  }

  private async processDataset(
    id: HDF5Id,
    path: string,
    name: string
  ): Promise<HsdsDataset> {
    const dataset = await this.fetchDataset(id);
    const { shape, type, attributeCount } = dataset;

    const attributes =
      attributeCount > 0
        ? await this.fetchAttributes(HDF5Collection.Datasets, id)
        : [];

    return {
      uid: nanoid(),
      id,
      path,
      name,
      kind: EntityKind.Dataset,
      attributes,
      shape,
      type,
    };
  }

  private async processDatatype(
    id: HDF5Id,
    path: string,
    name: string
  ): Promise<Datatype> {
    const { type } = await this.fetchDatatype(id);

    return {
      uid: nanoid(),
      path,
      name,
      kind: EntityKind.Datatype,
      attributes: [],
      type,
    };
  }

  private async resolveLink(
    link: HDF5Link,
    path: string,
    depth: number
  ): Promise<Entity> {
    if (!isHardLink(link)) {
      return {
        uid: nanoid(),
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
