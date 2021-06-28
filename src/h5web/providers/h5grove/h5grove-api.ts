import {
  ValueRequestParams,
  Attribute,
  Entity,
  Dataset,
  EntityKind,
  Group,
} from '../models';
import { isDatasetResponse, isGroupResponse } from './utils';
import { assertDataset } from '../../guards';
import { ProviderApi } from '../api';
import type {
  H5GroveDataResponse,
  H5GroveAttrResponse,
  H5GroveMetaResponse,
  H5GroveDatasetMetaReponse,
  H5GroveGroupMetaResponse,
} from './models';
import { convertDtype, flattenValue } from '../utils';

export class H5GroveApi extends ProviderApi {
  /* API compatible with h5grove@0.0.1 */
  public constructor(url: string, filepath: string) {
    super(filepath, { baseURL: url });
  }

  public async getEntity(path: string): Promise<Entity> {
    return this.processEntity(path, 1);
  }

  public async getValue(params: ValueRequestParams): Promise<unknown> {
    const { path, selection } = params;
    const [value, entity] = await Promise.all([
      this.fetchData(params),
      this.getEntity(path),
    ]);

    assertDataset(entity);

    return flattenValue(value, entity, selection);
  }

  private async fetchAttributes(path: string): Promise<H5GroveAttrResponse> {
    const { data } = await this.client.get<H5GroveAttrResponse>(
      `/attr/${this.filepath}?path=${path}`
    );
    return data;
  }

  private async fetchData(
    params: ValueRequestParams
  ): Promise<H5GroveDataResponse> {
    const { path, selection = '' } = params;
    const { data } = await this.cancellableFetchValue<H5GroveDataResponse>(
      `/data/${this.filepath}?path=${path}${
        selection && `&selection=${selection}`
      }`,
      params
    );
    return data;
  }

  private async fetchMetadata(path: string): Promise<H5GroveMetaResponse> {
    const { data } = await this.client.get<H5GroveMetaResponse>(
      `/meta/${this.filepath}?path=${path}`
    );
    return data;
  }

  private async processEntity(
    path: string,
    depth: number
  ): Promise<Group | Dataset | Entity> {
    const response = await this.fetchMetadata(path);

    if (isGroupResponse(response)) {
      const { name, type, children } = response;

      if (depth === 0) {
        return {
          attributes: await this.processAttributes(path, response),
          path,
          name,
          kind: type,
          children: [],
        };
      }

      return {
        attributes: await this.processAttributes(path, response),
        path,
        name,
        kind: type,
        children: await Promise.all(
          children.map((content) =>
            this.processEntity(
              `${path !== '/' ? path : ''}/${content.name}`,
              depth - 1
            )
          )
        ),
      };
    }

    if (isDatasetResponse(response)) {
      // `dtype` is the type of the data contained in the dataset
      const { name, type: kind, dtype, shape } = response;

      return {
        attributes: await this.processAttributes(path, response),
        path,
        name,
        kind,
        shape,
        type: convertDtype(dtype),
        rawType: dtype,
      };
    }

    // Treat 'other' entities as unresolved
    return {
      attributes: [],
      name: response.name,
      path,
      kind: EntityKind.Unresolved,
    };
  }

  private async processAttributes(
    path: string,
    response: H5GroveDatasetMetaReponse | H5GroveGroupMetaResponse
  ): Promise<Attribute[]> {
    const { attributes: attrsMetadata } = response;

    if (attrsMetadata.length === 0) {
      return [];
    }

    const attrValues = await this.fetchAttributes(path);
    return attrsMetadata.map<Attribute>((attrMetadata) => {
      const { name, dtype, shape } = attrMetadata;
      return {
        name,
        shape,
        type: convertDtype(dtype),
        value: attrValues[name],
      };
    });
  }
}
