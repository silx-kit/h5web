import axios, { AxiosInstance } from 'axios';
import { mapValues } from 'lodash-es';
import type { ProviderAPI } from '../context';
import {
  HDF5Id,
  HDF5Value,
  HDF5Metadata,
  HDF5Collection,
  HDF5Values,
} from '../models';
import type { SilxMetadataResponse } from './models';

export class SilxApi implements ProviderAPI {
  public readonly domain: string;
  private readonly client: AxiosInstance;
  private values?: HDF5Values;

  public constructor(domain: string) {
    this.domain = domain;
    this.client = axios.create({
      baseURL: `https://www.silx.org/pub/h5web/${this.domain}`,
    });
  }

  public async getMetadata(): Promise<HDF5Metadata> {
    const { data } = await this.client.get<SilxMetadataResponse>(
      '/metadata.json'
    );

    return this.transformMetadata(data);
  }

  public async getValue(id: HDF5Id): Promise<HDF5Value | undefined> {
    if (this.values) {
      return this.values[id];
    }

    const { data } = await this.client.get<HDF5Values>('/values.json');

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
