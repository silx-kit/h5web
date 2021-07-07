import {
  ValueRequestParams,
  Dataset,
  Entity,
  EntityKind,
  GroupWithChildren,
} from '../models';
import { ProviderApi } from '../api';
import {
  assertGroupContent,
  isDatasetResponse,
  isGroupResponse,
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
import { convertDtype, flattenValue } from '../utils';

export class JupyterStableApi extends ProviderApi {
  /* API compatible with jupyterlab_hdf v0.5.1 */
  public constructor(url: string, filepath: string) {
    super(filepath, { baseURL: `${url}/hdf` });
  }

  public async getEntity(path: string): Promise<Entity> {
    return this.processEntity(path);
  }

  public async getValue(params: ValueRequestParams): Promise<unknown> {
    const { path, selection } = params;
    const [value, entity] = await Promise.all([
      this.fetchData(params),
      this.getEntity(path),
    ]);

    assertDataset(entity);
    const flatValue = flattenValue(value, entity, selection);

    if (hasComplexType(entity)) {
      return parseComplex(flatValue as JupyterComplex);
    }

    return flatValue;
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

  protected async fetchData(
    params: ValueRequestParams
  ): Promise<JupyterDataResponse> {
    const { path, selection = '' } = params;
    const { data } = await this.cancellableFetchValue<JupyterDataResponse>(
      `/data/${this.filepath}?uri=${path}${selection && `&ixstr=${selection}`}`,
      params
    );
    return data;
  }

  /** The main tree-building method */
  protected async processEntity(
    path: string,
    isChild = false
  ): Promise<Entity> {
    const response = await this.fetchMetadata(path);
    const baseEntity = await this.processBaseEntity(path, response);

    if (isGroupResponse(response)) {
      const { type: kind } = response;

      if (isChild) {
        return { ...baseEntity, kind }; // don't fetch nested groups' children
      }

      const contents = await this.processContents(path, response);
      return {
        ...baseEntity,
        kind,
        children: await Promise.all(
          contents.map((content) => this.processEntity(content.uri, true))
        ),
      } as GroupWithChildren;
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
      } as Dataset;
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
