import axios, { AxiosInstance } from 'axios';
import { Group, Dataset, Metadata, EntityKind, Link, Entity } from '../models';
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
import { makeStrAttr, floatType } from '../mock/utils';
import {
  HDF5LinkClass,
  HDF5ShapeClass,
  HDF5Value,
  HDF5SoftLink,
} from '../hdf5-models';
import { assertGroup } from '../../guards';

export class JupyterApi implements ProviderAPI {
  public readonly domain: string;
  private readonly client: AxiosInstance;

  public constructor(url: string, domain: string) {
    this.domain = domain;
    this.client = axios.create({
      baseURL: `${url}/hdf`,
    });
  }

  public async getMetadata(): Promise<Metadata> {
    const rootGrp = await this.processEntity('/');
    assertGroup(rootGrp);
    return rootGrp;
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
    depth = Infinity
  ): Promise<Group | Dataset | Link<HDF5SoftLink>> {
    const response = await this.fetchMetadata(path);
    const { attributeCount } = response;

    const attrReponse =
      attributeCount > 0 ? await this.fetchAttributes(path) : {};
    const attributes = Object.entries(attrReponse).map(([name, value]) =>
      // TODO: fix this once I can infer the type of attributes
      makeStrAttr(name, value)
    );

    if (isGroupResponse(response)) {
      const { name, type, childrenCount } = response;
      const contents = childrenCount > 0 ? await this.fetchContents(path) : [];
      assertGroupContent(contents);

      const children =
        depth > 0
          ? await Promise.all(
              contents.map((content) => {
                return this.processEntity(content.uri, depth - 1);
              })
            )
          : [];

      const group: Group = {
        uid: nanoid(),
        id: path,
        name,
        path,
        kind: type,
        children,
        attributes,
      };

      group.children.forEach((child) => {
        child.parent = group;
      });

      return group;
    }

    if (isDatasetResponse(response)) {
      const { name, type, shape: dims } = response;
      return {
        uid: nanoid(),
        id: path,
        name,
        path,
        kind: type,
        attributes,
        // TODO: Find the type from the dtype OR change the backend to return the true HDF5Type
        type: floatType,
        shape:
          dims.length > 0
            ? { class: HDF5ShapeClass.Simple, dims }
            : { class: HDF5ShapeClass.Scalar },
        // `parent` is set by the containing group
      };
    }

    // Consider other as unresolved soft links
    return {
      uid: nanoid(),
      name: path,
      path,
      kind: EntityKind.Link,
      attributes,
      rawLink: {
        class: HDF5LinkClass.Soft,
        title: path,
        h5path: path,
      },
    };
  }
}
