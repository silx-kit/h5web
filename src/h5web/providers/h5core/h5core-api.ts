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
  H5CoreDataResponse,
  H5CoreAttrResponse,
  H5CoreMetaResponse,
  H5CoreDatasetMetaReponse,
  H5CoreGroupMetaResponse,
} from './models';
import { convertDtype, flattenValue } from '../utils';

export class H5CoreApi extends ProviderApi {
  /* API compatible with h5core@bccdb1f77f568d6f7d3519a07c9b3bef7e9ecc20 */
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

  private async fetchAttributes(path: string): Promise<H5CoreAttrResponse> {
    const { data } = await this.client.get<H5CoreAttrResponse>(
      `/attr/${this.filepath}?path=${path}`
    );
    return data;
  }

  private async fetchData(
    params: ValueRequestParams
  ): Promise<H5CoreDataResponse> {
    const { path, selection = '' } = params;
    const { data } = await this.cancellableFetchValue<H5CoreDataResponse>(
      `/data/${this.filepath}?path=${path}${
        selection && `&selection=${selection}`
      }`,
      params
    );
    return data;
  }

  private async fetchMetadata(path: string): Promise<H5CoreMetaResponse> {
    const { data } = await this.client.get<H5CoreMetaResponse>(
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
    response: H5CoreDatasetMetaReponse | H5CoreGroupMetaResponse
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
