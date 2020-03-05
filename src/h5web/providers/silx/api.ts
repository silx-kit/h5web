import axios, { AxiosInstance } from 'axios';
import { SilxMetadata, SilxValues } from './models';

export class SilxApi {
  private readonly client: AxiosInstance;

  private metadata?: SilxMetadata;

  private values?: SilxValues;

  constructor(domain: string) {
    this.client = axios.create({
      baseURL: `https://www.silx.org/pub/h5web/${domain}`,
    });
  }

  public async getMetadata(): Promise<SilxMetadata> {
    if (this.metadata) {
      return this.metadata;
    }

    const { data } = await this.client.get<SilxMetadata>('/metadata.json');

    this.metadata = data;
    return this.metadata;
  }

  public async getValues(): Promise<SilxValues> {
    if (this.values) {
      return this.values;
    }

    const { data } = await this.client.get<SilxValues>('/values.json');

    this.values = data;
    return this.values;
  }
}
