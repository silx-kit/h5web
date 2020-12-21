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
} from './models';
import type { Metadata } from '../models';
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
} from '../hdf5-models';
import { isReachable } from '../../guards';
import type { ProviderAPI } from '../context';
import { buildTree } from '../utils';

export class HsdsApi implements ProviderAPI {
  public readonly domain: string;
  private readonly client: AxiosInstance;

  private groups: Record<HDF5Id, HDF5Group> = {};
  private datasets: Record<HDF5Id, HDF5Dataset> = {};
  private datatypes: Record<HDF5Id, HDF5Datatype> = {};
  private values: Record<HDF5Id, HDF5Value> = {};

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
    const rootId = await this.fetchRoot();
    await this.processGroup(rootId);

    return buildTree(
      {
        root: rootId,
        groups: this.groups,
        datasets: this.datasets,
        datatypes: this.datatypes,
      },
      this.domain
    );
  }

  public async getValue(id: HDF5Id): Promise<HDF5Value> {
    if (id in this.values) {
      return this.values[id];
    }

    const value = await this.fetchValue(id);

    this.values[id] = value;
    return this.values[id];
  }

  private async fetchRoot(): Promise<HDF5Id> {
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

  private async fetchLinks(id: HDF5Id): Promise<HDF5Link[]> {
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

  private async fetchValue(id: HDF5Id): Promise<HDF5Value> {
    const { data } = await this.client.get<HsdsValueResponse>(
      `/datasets/${id}/value`
    );
    return data.value;
  }

  /* Processing methods to fetch links and attributes in addition to the entity. Also updates API members. */

  private async processGroup(id: HDF5Id): Promise<void> {
    const { attributeCount, linkCount, ...group } = await this.fetchGroup(id);

    const [attributes, links] = await Promise.all([
      attributeCount > 0
        ? this.fetchAttributes(HDF5Collection.Groups, id)
        : Promise.resolve(undefined),
      linkCount > 0 ? this.fetchLinks(id) : Promise.resolve(undefined),
    ]);

    this.groups[id] = {
      ...group,
      ...(attributes ? { attributes } : {}),
      ...(links ? { links } : {}),
    };

    if (links) {
      await Promise.all(
        links.filter(isReachable).map(this.resolveLink.bind(this))
      );
    }
  }

  private async processDataset(id: HDF5Id): Promise<void> {
    const { attributeCount, ...dataset } = await this.fetchDataset(id);

    const attributes =
      attributeCount > 0
        ? await this.fetchAttributes(HDF5Collection.Datasets, id)
        : undefined;

    this.datasets[id] = {
      ...dataset,
      ...(attributes ? { attributes } : {}),
    };
  }

  private async processDatatype(id: HDF5Id): Promise<void> {
    const datatype = await this.fetchDatatype(id);
    this.datatypes[id] = datatype;
  }

  private async resolveLink(link: HDF5HardLink | HDF5RootLink): Promise<void> {
    const { collection, id } = link;

    if (collection === HDF5Collection.Groups) {
      return this.processGroup(id);
    }
    if (collection === HDF5Collection.Datasets) {
      return this.processDataset(id);
    }
    if (collection === HDF5Collection.Datatypes) {
      return this.processDatatype(id);
    }

    throw new Error('Unknown collection !');
  }
}
