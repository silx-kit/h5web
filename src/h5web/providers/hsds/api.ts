import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  HsdsValues,
  HsdsDatasetResponse,
  HsdsDatatypeResponse,
  HsdsGroupResponse,
  HsdsMetadata,
  HsdsAttributesResponse,
  HsdsLinksResponse,
  HsdsRootResponse,
  HsdsValueResponse,
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
} from '../models';
import { isReachable } from '../utils';

export class HsdsApi {
  private readonly client: AxiosInstance;

  private config: AxiosRequestConfig;

  private metadata?: HsdsMetadata;

  private groups: Record<HDF5Id, HDF5Group> = {};

  private datasets: Record<HDF5Id, HDF5Dataset> = {};

  private datatypes: Record<HDF5Id, HDF5Datatype> = {};

  private values: Record<HDF5Id, HsdsValues> = {};

  constructor(private readonly domain: string) {
    this.config = {
      params: { domain: this.domain },
      auth: {
        username: 'test_user1',
        password: 'test',
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

  private async fetchRoot(): Promise<HsdsRootResponse> {
    const { data } = await this.client.get<HsdsRootResponse>('/', this.config);
    return data;
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

  private async fetchLinks(id: HDF5Id): Promise<HsdsLinksResponse> {
    const { data } = await this.client.get<HsdsLinksResponse>(
      `/groups/${id}/links`,
      this.config
    );
    return data;
  }

  private async fetchAttributes(
    collection: HDF5Collection,
    id: HDF5Id
  ): Promise<HsdsAttributesResponse> {
    const { data } = await this.client.get<HsdsAttributesResponse>(
      `/${collection}/${id}/attributes`,
      this.config
    );
    return data;
  }

  private async fetchValue(id: HDF5Id): Promise<HsdsValueResponse> {
    const { data } = await this.client.get<HsdsValueResponse>(
      `/datasets/${id}/value`,
      this.config
    );
    return data;
  }

  /* Processing methods to fetch links and attributes in addition to the entity. Also updates API members. */

  private async processGroup(id: HDF5Id): Promise<void> {
    const response = await this.fetchGroup(id);

    const { attributes } =
      response.attributeCount > 0
        ? await this.fetchAttributes(HDF5Collection.Groups, id)
        : { attributes: undefined };
    const { links } =
      response.linkCount > 0 ? await this.fetchLinks(id) : { links: undefined };

    this.groups[id] = { attributes, links };

    if (links) {
      const linksResolutions = links
        .filter(isReachable)
        .map(link => this.resolveLink(link));
      await Promise.all(linksResolutions);
    }
  }

  private async processDataset(id: HDF5Id): Promise<void> {
    const response = await this.fetchDataset(id);

    const { attributes } =
      response.attributeCount > 0
        ? await this.fetchAttributes(HDF5Collection.Datasets, id)
        : { attributes: undefined };

    this.datasets[id] = { ...response, attributes };
  }

  private async processDatatype(id: HDF5Id): Promise<void> {
    // So far, HsdsDatatype and HDF5Datatype are the same
    this.datatypes[id] = await this.fetchDatatype(id);
  }

  /* Others */
  public async getMetadata(): Promise<HsdsMetadata> {
    if (this.metadata) {
      return this.metadata;
    }

    const { root: rootId } = await this.fetchRoot();

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

    const { value } = await this.fetchValue(id);

    this.values[id] = value;
    return this.values[id];
  }
}
