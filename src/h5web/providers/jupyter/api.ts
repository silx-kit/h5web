import axios, { AxiosInstance } from 'axios';
import { Group, Dataset, EntityKind, Link, Entity } from '../models';
import type { ProviderAPI } from '../context';
import {
  assertGroupContent,
  isDatasetResponse,
  isGroupResponse,
} from './utils';
import type {
  JupyterAttrsResponse,
  JupyterContentResponse,
  JupyterDataResponse,
  JupyterMetaResponse,
} from './models';
import { nanoid } from 'nanoid';
import { makeStrAttr, floatType } from '../mock/data-utils';
import {
  HDF5LinkClass,
  HDF5ShapeClass,
  HDF5Value,
  HDF5SoftLink,
} from '../hdf5-models';

export class JupyterApi implements ProviderAPI {
  public readonly domain: string;
  private readonly client: AxiosInstance;

  public constructor(url: string, domain: string) {
    this.domain = domain;
    this.client = axios.create({
      baseURL: `${url}/hdf`,
    });
  }

  public async getEntity(path: string): Promise<Entity> {
    return this.processEntity(path, 1);
  }

  public async getValue(path: string): Promise<HDF5Value> {
    const { data } = await this.client.get<JupyterDataResponse>(
      `/data/${this.domain}?uri=${path}`
    );
    return data;
  }

  private async fetchAttributes(path: string): Promise<JupyterAttrsResponse> {
    const { data } = await this.client.get<JupyterAttrsResponse>(
      `/attrs/${this.domain}?uri=${path}`
    );
    return data;
  }

  private async fetchMetadata(path: string): Promise<JupyterMetaResponse> {
    const { data } = await this.client.get<JupyterMetaResponse>(
      `/meta/${this.domain}?uri=${path}`
    );
    return data;
  }

  private async fetchContents(path: string): Promise<JupyterContentResponse> {
    const { data } = await this.client.get<JupyterContentResponse>(
      `/contents/${this.domain}?uri=${path}`
    );
    return data;
  }

  /** The main tree-building method */
  private async processEntity(
    path: string,
    depth: number
  ): Promise<Group | Dataset | Link<HDF5SoftLink>> {
    const response = await this.fetchMetadata(path);
    const { attributeCount } = response;

    const attrReponse =
      attributeCount > 0 ? await this.fetchAttributes(path) : {};
    const attributes = Object.entries(attrReponse).map(([name, value]) =>
      // TODO: fix this once I can infer the type of attributes
      makeStrAttr(name, value)
    );

    const baseEntity = {
      uid: nanoid(),
      id: path,
      name: response.name,
      path,
      attributes,
    };

    if (isGroupResponse(response)) {
      const { type, childrenCount } = response;

      if (depth === 0 || childrenCount === 0) {
        return {
          ...baseEntity,
          kind: type,
          children: [],
        };
      }

      const contents = await this.fetchContents(path);
      assertGroupContent(contents);

      return {
        ...baseEntity,
        kind: type,
        children: await Promise.all(
          contents.map((content) => this.processEntity(content.uri, depth - 1))
        ),
      };
    }

    if (isDatasetResponse(response)) {
      const { type, shape: dims } = response;
      return {
        ...baseEntity,
        kind: type,
        // TODO: Find the type from the dtype OR change the backend to return the true HDF5Type
        type: floatType,
        shape:
          dims.length > 0
            ? { class: HDF5ShapeClass.Simple, dims }
            : { class: HDF5ShapeClass.Scalar },
      };
    }

    // Consider other as unresolved soft links
    return {
      ...baseEntity,
      kind: EntityKind.Link,
      rawLink: {
        class: HDF5LinkClass.Soft,
        title: path,
        h5path: path,
      },
    };
  }
}
