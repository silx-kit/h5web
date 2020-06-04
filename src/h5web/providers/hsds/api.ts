import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
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
import {
  HDF5Collection,
  HDF5Dataset,
  HDF5Datatype,
  HDF5Group,
  HDF5HardLink,
  HDF5Id,
  HDF5RootLink,
  HDF5Value,
  HDF5Metadata,
  HDF5Attribute,
  HDF5Link,
} from '../models';
import { isReachable } from '../utils';
import type { ProviderAPI } from '../context';

export class HsdsApi implements ProviderAPI {
  private readonly client: AxiosInstance;
  private readonly domain: string;
  private readonly config: AxiosRequestConfig;

  private metadata?: HDF5Metadata;
  private groups: Record<HDF5Id, HDF5Group> = {};
  private datasets: Record<HDF5Id, HDF5Dataset> = {};
  private datatypes: Record<HDF5Id, HDF5Datatype> = {};
  private values: Record<HDF5Id, HDF5Value> = {};

  constructor(username: string, password: string, filepath: string) {
    this.domain = `/home/${username}/${filepath}`;
    this.config = {
      params: { domain: this.domain },
      auth: {
        username,
        password,
      },
    };
    // Giving the config to the client should set the headers and params for all client requests but it does not (bug axios 0.19.2) !
    // The fix is merged but not released (https://github.com/axios/axios/releases).
    // In the mean time, we put this.config in arg to all client requests.
    this.client = axios.create({
      baseURL: `http://localhost:80`,
      ...this.config,
    });
  }

  /* Basic API methods */
  public getDomain(): string {
    return this.domain;
  }

  private async fetchRoot(): Promise<HDF5Id> {
    const { data } = await this.client.get<HsdsRootResponse>('/', this.config);
    return data.root;
  }

  private async fetchDataset(id: HDF5Id): Promise<HsdsDatasetResponse> {
    const { data } = await this.client.get<HsdsDatasetResponse>(
      `/datasets/${id}`,
      this.config
    );
    return data;
  }

  private async fetchDatatype(id: HDF5Id): Promise<HsdsDatatypeResponse> {
    const { data } = await this.client.get<HsdsDatatypeResponse>(
      `/datatypes/${id}`,
      this.config
    );
    return data;
  }

  private async fetchGroup(id: HDF5Id): Promise<HsdsGroupResponse> {
    const { data } = await this.client.get<HsdsGroupResponse>(
      `/groups/${id}`,
      this.config
    );
    return data;
  }

  private async fetchLinks(id: HDF5Id): Promise<HDF5Link[]> {
    const { data } = await this.client.get<HsdsLinksResponse>(
      `/groups/${id}/links`,
      this.config
    );
    return data.links;
  }

  private async fetchAttributes(
    entityCollection: HDF5Collection,
    entityId: HDF5Id
  ): Promise<HDF5Attribute[]> {
    const { data } = await this.client.get<HsdsAttributesResponse>(
      `/${entityCollection}/${entityId}/attributes`,
      this.config
    );
    const attrsPromises = data.attributes.map(attr =>
      this.client
        .get<HsdsAttributeWithValueResponse>(
          `/${entityCollection}/${entityId}/attributes/${attr.name}`,
          this.config
        )
        .then(response => response.data)
    );
    return Promise.all(attrsPromises);
  }

  private async fetchValue(id: HDF5Id): Promise<HDF5Value> {
    const { data } = await this.client.get<HsdsValueResponse>(
      `/datasets/${id}/value`,
      this.config
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
      collection: HDF5Collection.Groups,
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
      collection: HDF5Collection.Datasets,
      ...dataset,
      ...(attributes ? { attributes } : {}),
    };
  }

  private async processDatatype(id: HDF5Id): Promise<void> {
    const datatype = await this.fetchDatatype(id);

    this.datatypes[id] = {
      collection: HDF5Collection.Datatypes,
      ...datatype,
    };
  }

  /* Others */
  public async getMetadata(): Promise<HDF5Metadata> {
    if (this.metadata) {
      return this.metadata;
    }

    const rootId = await this.fetchRoot();
    await this.processGroup(rootId);

    this.metadata = {
      root: rootId,
      groups: this.groups,
      datasets: this.datasets,
      datatypes: this.datatypes,
    };

    return this.metadata;
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

  public async getValue(id: HDF5Id): Promise<HDF5Value> {
    if (id in this.values) {
      return this.values[id];
    }

    const value = await this.fetchValue(id);

    this.values[id] = value;
    return this.values[id];
  }
}
