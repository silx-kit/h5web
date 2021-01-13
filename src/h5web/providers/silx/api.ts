import axios, { AxiosInstance } from 'axios';
import { buildTree } from '../utils';
import type { ProviderAPI } from '../context';
import type {
  HDF5Id,
  HDF5Value,
  HDF5Metadata,
  HDF5Values,
} from '../hdf5-models';
import type { Entity, Metadata } from '../models';
import { getEntityAtPath } from '../../utils';
import { assertDefined } from '../../guards';

export class SilxApi implements ProviderAPI {
  public readonly domain: string;
  private readonly client: AxiosInstance;
  private metadata?: Metadata;
  private values?: HDF5Values;

  public constructor(domain: string) {
    this.domain = domain;
    this.client = axios.create({
      baseURL: `https://www.silx.org/pub/h5web/${this.domain}`,
    });
  }

  public async getMetadata(): Promise<Metadata> {
    if (!this.metadata) {
      const { data } = await this.client.get<HDF5Metadata>('/metadata.json');
      this.metadata = buildTree(data, this.domain);
    }

    return this.metadata;
  }

  public async getEntity(path: string): Promise<Entity> {
    const metadata = this.metadata || (await this.getMetadata());

    const entity = getEntityAtPath(metadata, path);
    assertDefined(entity);

    return entity;
  }

  public async getValue(id: HDF5Id): Promise<HDF5Value> {
    if (!this.values) {
      const { data } = await this.client.get<HDF5Values>('/values.json');
      this.values = data;
    }

    return this.values[id];
  }
}
