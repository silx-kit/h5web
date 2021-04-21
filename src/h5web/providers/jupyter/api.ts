import axios, { AxiosInstance } from 'axios';
import { Group, Dataset, Entity, EntityKind } from '../models';
import type { GetValueParams, ProviderAPI } from '../context';
import {
  assertGroupContent,
  isDatasetResponse,
  isGroupResponse,
  convertDtype,
  parseComplex,
} from './utils';
import type {
  JupyterAttrsResponse,
  JupyterBaseEntity,
  JupyterComplex,
  JupyterContentGroupResponse,
  JupyterContentResponse,
  JupyterDataResponse,
  JupyterMetaGroupResponse,
  JupyterMetaResponse,
} from './models';
import { makeStrAttr } from '../mock/metadata-utils';
import { assertDataset, hasComplexType } from '../../guards';

export class JupyterStableApi implements ProviderAPI {
  /* API compatible with jupyterlab_hdf v0.5.1 */
  public readonly filepath: string;
  protected readonly client: AxiosInstance;

  public constructor(url: string, filepath: string) {
    this.filepath = filepath;
    this.client = axios.create({
      baseURL: `${url}/hdf`,
    });
  }

  public async getEntity(path: string): Promise<Entity> {
    return this.processEntity(path, 1);
  }

  public async getValue(params: GetValueParams): Promise<unknown> {
    const { path, selection = '' } = params;

    const [{ data }, entity] = await Promise.all([
      this.client.get<JupyterDataResponse>(
        `/data/${this.filepath}?uri=${path}${
          selection && `&ixstr=${selection}`
        }`
      ),
      this.getEntity(path),
    ]);
    assertDataset(entity);

    if (hasComplexType(entity)) {
      return parseComplex(data as JupyterComplex);
    }

    return data;
  }

  protected async fetchAttributes(path: string): Promise<JupyterAttrsResponse> {
    const { data } = await this.client.get<JupyterAttrsResponse>(
      `/attrs/${this.filepath}?uri=${path}`
    );
    return data;
  }

  protected async fetchMetadata(path: string): Promise<JupyterMetaResponse> {
    const { data } = await this.client.get<JupyterMetaResponse>(
      `/meta/${this.filepath}?uri=${path}`
    );
    return data;
  }

  protected async fetchContents(path: string): Promise<JupyterContentResponse> {
    const { data } = await this.client.get<JupyterContentResponse>(
      `/contents/${this.filepath}?uri=${path}`
    );
    return data;
  }

  /** The main tree-building method */
  protected async processEntity(
    path: string,
    depth: number
  ): Promise<Group | Dataset | Entity> {
    const response = await this.fetchMetadata(path);
    const baseEntity = await this.processBaseEntity(path, response);

    if (isGroupResponse(response)) {
      const { type } = response;

      if (depth === 0) {
        return {
          ...baseEntity,
          kind: type,
          children: [],
        };
      }

      const contents = await this.processContents(path, response);

      return {
        ...baseEntity,
        kind: type,
        children: await Promise.all(
          contents.map((content) => this.processEntity(content.uri, depth - 1))
        ),
      };
    }

    if (isDatasetResponse(response)) {
      // `dtype` is the type of the data contained in the dataset
      const { type: kind, dtype, shape } = response;

      return {
        ...baseEntity,
        kind,
        shape,
        type: convertDtype(dtype),
        rawType: dtype,
      };
    }

    // Treat 'other' entities as unresolved
    return {
      ...baseEntity,
      kind: EntityKind.Unresolved,
    };
  }

  protected async processBaseEntity(
    path: string,
    response: JupyterMetaResponse
  ): Promise<JupyterBaseEntity> {
    // TODO: To fix once we have `attributeCount`
    const attrReponse = await this.fetchAttributes(path);
    const attributes = Object.entries(attrReponse).map(([name, value]) =>
      // TODO: fix this once I can infer the type of attributes
      makeStrAttr(name, value)
    );

    return {
      name: response.name,
      path,
      attributes,
    };
  }

  protected async processContents(
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    response: JupyterMetaGroupResponse
  ): Promise<JupyterContentGroupResponse> {
    const contents = await this.fetchContents(path);
    assertGroupContent(contents);

    return contents;
  }
}
