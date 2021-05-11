import { JupyterStableApi } from './jupyter-api';
import type { ValueRequestParams, Attribute } from '../models';
import type {
  JupyterBaseEntity,
  JupyterContentGroupResponse,
  JupyterMetaGroupResponse,
  JupyterMetaResponse,
} from './models';
import { assertGroupContent, convertDtype } from './utils';

interface DevJupyterAttrMeta {
  name: string;
  dtype: string;
  shape: number[];
}

interface DevJupyterMetaResponse extends JupyterMetaResponse {
  attributes: DevJupyterAttrMeta[];
}

interface DevJupyterMetaGroupResponse extends JupyterMetaGroupResponse {
  attributes: DevJupyterAttrMeta[];
  childrenCount: number;
}

export class JupyterDevApi extends JupyterStableApi {
  /* API compatible with jupyterlab_hdf@08ab021e33ab8e0cd96254c5003bc72003b6f5ed */
  public constructor(url: string, filepath: string) {
    super(url, filepath);
    // eslint-disable-next-line no-console
    console.warn('Using Jupyter dev API');
  }

  public async getValue(params: ValueRequestParams): Promise<unknown> {
    return this.fetchData(params);
  }

  protected async fetchMetadata(path: string): Promise<DevJupyterMetaResponse> {
    const { data } = await this.client.get<DevJupyterMetaResponse>(
      `/meta/${this.filepath}?uri=${path}`
    );
    return data;
  }

  protected async processBaseEntity(
    path: string,
    response: DevJupyterMetaResponse
  ): Promise<JupyterBaseEntity> {
    const { attributes: attrsMetadata } = response;

    if (attrsMetadata.length === 0) {
      return {
        name: response.name,
        path,
        attributes: [],
      };
    }

    /* Lazy-fetching of attribute values could be implemented once this is part of the stable API */
    const attrValues = await this.fetchAttributes(path);
    const attributes = attrsMetadata.map<Attribute>((attrMetadata) => {
      const { name, dtype, shape } = attrMetadata;
      return {
        name,
        shape,
        type: convertDtype(dtype),
        value: attrValues[name],
      };
    });

    return {
      name: response.name,
      path,
      attributes,
    };
  }

  protected async processContents(
    path: string,
    response: DevJupyterMetaGroupResponse
  ): Promise<JupyterContentGroupResponse> {
    const { childrenCount } = response;
    if (childrenCount === 0) {
      return [];
    }

    const contents = await this.fetchContents(path);
    assertGroupContent(contents);

    return contents;
  }
}
