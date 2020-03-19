import axios, { AxiosInstance } from 'axios';
import { mapValues } from 'lodash-es';
import { ProviderAPI } from '../context';
import { HDF5Id, HDF5Value, HDF5Metadata, HDF5Collection } from '../models';
import { SilxValuesResponse, SilxMetadataResponse } from './models';

export class SilxApi implements ProviderAPI {
  private readonly client: AxiosInstance;

  private metadata?: HDF5Metadata;
  private values?: Record<string, HDF5Value>;

  constructor(private readonly domain: string) {
    this.client = axios.create({
      baseURL: `https://www.silx.org/pub/h5web/${this.domain}`,
    });
  }

  public getDomain(): string {
    return this.domain;
  }

  public async getMetadata(): Promise<HDF5Metadata> {
    if (this.metadata) {
      return this.metadata;
    }

    const { data } = await this.client.get<SilxMetadataResponse>(
      '/metadata.json'
    );

    this.metadata = this.transformMetadata(data);
    return this.metadata;
  }

  public async getValue(id: HDF5Id): Promise<HDF5Value> {
    if (this.values) {
      return this.values[id];
    }

    const { data } = await this.client.get<SilxValuesResponse>('/values.json');

    this.values = data;
    return this.values[id];
  }

  private transformMetadata(response: SilxMetadataResponse): HDF5Metadata {
    const { root, groups, datasets, datatypes } = response;

    return {
      root,
      groups: mapValues(groups, (group, id) => ({
        id,
        collection: HDF5Collection.Groups as const,
        ...group,
      })),
      datasets: mapValues(datasets || {}, (dataset, id) => ({
        id,
        collection: HDF5Collection.Datasets as const,
        ...dataset,
      })),
      datatypes: mapValues(datatypes || {}, (datatype, id) => ({
        id,
        collection: HDF5Collection.Datatypes as const,
        ...datatype,
      })),
    };
  }
}
