import axios, { AxiosInstance } from 'axios';
import { buildTree } from '../utils';
import type { ProviderAPI } from '../context';
import {
  HDF5Id,
  HDF5Value,
  HDF5Metadata,
  HDF5Values,
  MyHDF5Metadata,
} from '../models';

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

  public async getMetadata(): Promise<MyHDF5Metadata> {
    const { data } = await this.client.get<HDF5Metadata>('/metadata.json');
    return buildTree(data, this.domain);
  }

  public async getValue(id: HDF5Id): Promise<HDF5Value | undefined> {
    if (this.values) {
      return this.values[id];
    }

    const { data } = await this.client.get<HDF5Values>('/values.json');

    this.values = data;
    return this.values[id];
  }
}
