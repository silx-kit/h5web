import axios, { AxiosInstance } from 'axios';
import { SilxMetadata, SilxValues } from './models';

export class SilxApi {
  private readonly client: AxiosInstance;

  private readonly metadata?: SilxMetadata;

  private readonly values?: SilxValues;

  constructor(domain: string) {
    this.client = axios.create({
      baseURL: `http://www.silx.org/pub/h5web/${domain}`,
    });
  }

  public async getMetadata(): Promise<SilxMetadata> {
    if (this.metadata) {
      return this.metadata;
    }

    // const { data } = await this.client.get<SilxMetadata>('/metadata.json');
    // return data;

    return (await import('../../../demo-app/mock-data/metadata.json'))
      .default as SilxMetadata;
  }

  public async getValues(): Promise<SilxValues> {
    if (this.values) {
      return this.values;
    }

    // const { data } = await this.client.get<SilxValues>('/values.json');
    // return data;

    return (await import('../../../demo-app/mock-data/values.json'))
      .default as SilxValues;
  }
}
