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
} from './models';
import type { Entity, Metadata } from '../models';
import {
  HDF5Collection,
  HDF5Dataset,
  HDF5Datatype,
  HDF5Group,
  HDF5HardLink,
  HDF5Id,
  HDF5RootLink,
  HDF5Value,
  HDF5Attribute,
  HDF5Link,
  HDF5LinkClass,
  HDF5Metadata,
} from '../hdf5-models';
import { assertDefined, assertReachable, isReachable } from '../../guards';
import type { ProviderAPI } from '../context';
import { buildEntity, buildTree } from '../utils';
import { isHsdsExternalLink } from './utils';

export class HsdsApi implements ProviderAPI {
  public readonly domain: string;
  private readonly client: AxiosInstance;

  private rootId?: string;
  private readonly entitiesByPath = new Map<string, Entity>();

  private groups: Record<HDF5Id, HDF5Group> = {};
  private datasets: Record<HDF5Id, HDF5Dataset> = {};
  private datatypes: Record<HDF5Id, HDF5Datatype> = {};

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

  public async getMetadata(): Promise<Metadata> {
    const rootId = await this.getRootId();
    await this.processGroup(rootId);
    return buildTree(await this.getHdf5Metadata(), this.domain);
  }

  public async getEntity(path: string): Promise<Entity> {
    if (this.entitiesByPath.has(path)) {
      return this.entitiesByPath.get(path) as Entity;
    }

    const entityLink = await this.getLinkTo(path);
    await this.resolveLink(entityLink, path, 1);

    const entity = buildEntity(await this.getHdf5Metadata(), entityLink);
    this.entitiesByPath.set(path, entity);
    return entity;
  }

  public async getValue(id: HDF5Id): Promise<HDF5Value> {
    const { data } = await this.client.get<HsdsValueResponse>(
      `/datasets/${id}/value`
    );
    return data.value;
  }

  private async getRootId(): Promise<HDF5Id> {
    if (!this.rootId) {
      this.rootId = await this.fetchRootId();
    }

    return this.rootId;
  }

  private async getLinkTo(path: string): Promise<HDF5HardLink | HDF5RootLink> {
    if (path === '/') {
      const rootId = await this.getRootId();
      return {
        class: HDF5LinkClass.Root as const,
        collection: HDF5Collection.Groups as const,
        title: this.domain,
        id: rootId,
      };
    }

    const parentPath = path.slice(0, path.lastIndexOf('/')) || '/';
    const parentLink = await this.getLinkTo(parentPath);
    const parentGroup = await this.getHdf5Group(parentLink.id, parentPath);

    const childName = path.slice(path.lastIndexOf('/') + 1);
    const childLink = (parentGroup.links || []).find(
      ({ title }) => title === childName
    );
    assertDefined(childLink);
    assertReachable(childLink);

    return childLink;
  }

  private async getHdf5Group(id: HDF5Id, path: string): Promise<HDF5Group> {
    if (!this.groups[id]) {
      await this.processGroup(id, path, 1);
    }

    return this.groups[id];
  }

  private async getHdf5Metadata(): Promise<Required<HDF5Metadata>> {
    return {
      root: await this.getRootId(),
      groups: this.groups,
      datasets: this.datasets,
      datatypes: this.datatypes,
    };
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

  /* Processing methods to fetch links and attributes in addition to the entity. Also updates API members. */

  private async processGroup(
    id: HDF5Id,
    path = '',
    depth = Infinity
  ): Promise<void> {
    const { attributeCount, linkCount } = await this.fetchGroup(id);
    const [attributes, hsdsLinks] = await Promise.all([
      attributeCount > 0
        ? this.fetchAttributes(HDF5Collection.Groups, id)
        : Promise.resolve(undefined),
      linkCount > 0 && depth > 0
        ? this.fetchLinks(id)
        : Promise.resolve(undefined),
    ]);

    const links =
      hsdsLinks &&
      hsdsLinks.map<HDF5Link>((link: HsdsLink) =>
        isHsdsExternalLink(link) ? { ...link, file: link.h5domain } : link
      );

    this.groups[id] = {
      alias: [path || '/'], // path
      ...(attributes ? { attributes } : {}),
      ...(links ? { links } : {}),
    };

    if (links) {
      await Promise.all(
        links
          .filter(isReachable)
          .map((link) =>
            this.resolveLink(link, `${path}/${link.title}`, depth - 1)
          )
      );
    }
  }

  private async processDataset(id: HDF5Id, path: string): Promise<void> {
    const { attributeCount, ...dataset } = await this.fetchDataset(id);

    const attributes =
      attributeCount > 0
        ? await this.fetchAttributes(HDF5Collection.Datasets, id)
        : undefined;

    this.datasets[id] = {
      alias: [path],
      ...dataset,
      ...(attributes ? { attributes } : {}),
    };
  }

  private async processDatatype(id: HDF5Id, path: string): Promise<void> {
    const datatype = await this.fetchDatatype(id);
    this.datatypes[id] = { alias: [path], ...datatype };
  }

  private async resolveLink(
    link: HDF5HardLink | HDF5RootLink,
    path: string,
    depth = Infinity
  ): Promise<void> {
    const { collection, id } = link;

    if (collection === HDF5Collection.Groups) {
      return this.processGroup(id, path, depth);
    }
    if (collection === HDF5Collection.Datasets) {
      return this.processDataset(id, path);
    }
    if (collection === HDF5Collection.Datatypes) {
      return this.processDatatype(id, path);
    }

    throw new Error('Unknown collection !');
  }
}
