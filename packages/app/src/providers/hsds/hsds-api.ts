import {
  assertArray,
  assertDefined,
  hasScalarShape,
} from '@h5web/shared/guards';
import {
  type ArrayShape,
  type AttributeValues,
  type Dataset,
  DTypeClass,
  type Entity,
  EntityKind,
  type ProvidedEntity,
  type ScalarShape,
} from '@h5web/shared/hdf5-models';
import { buildEntityPath } from '@h5web/shared/hdf5-utils';
import {
  type BuiltInExporter,
  type ExportFormat,
  type ExportURL,
} from '@h5web/shared/vis-models';

import { isScalarSelection } from '../../vis-packs/core/utils';
import { DataProviderApi } from '../api';
import { type OnProgress } from '../models';
import {
  bigIntTypedArrayFromDType,
  createBasicFetcher,
  FetcherError,
  toJSON,
  typedArrayFromDType,
} from '../utils';
import {
  type HsdsAttributesWithValuesResponse,
  type HsdsCollection,
  type HsdsEntitiesResponse,
  type HsdsEntity,
  type HsdsEntityResponse,
  type HsdsId,
  type HsdsValueResponse,
} from './models';
import {
  assertHsdsDataset,
  assertHsdsEntity,
  convertHsdsEntity,
  convertHsdsSymbolicLink,
  toExtendedJSON,
} from './utils';

export class HsdsApi extends DataProviderApi {
  /* API compatible with hsds@1.0.1 */
  public constructor(
    private readonly baseURL: string,
    private readonly domain: string,
    private readonly fetcher = createBasicFetcher(),
    private readonly _getExportURL?: DataProviderApi['getExportURL'],
  ) {
    super(domain);
  }

  public override async getEntity(
    path: string,
  ): Promise<HsdsEntity<ProvidedEntity>> {
    const response = await this.fetchEntity(path);

    if (response.class === 'group') {
      const hsdsGroup = convertHsdsEntity(path, response);

      const { id, links } = response;
      const linksEntries = Object.entries(links).sort(
        (a, b) => a[0].localeCompare(b[0]), // `GET /` with `include_links` doesn't sort links predictably
      );

      const hardLinkedChildren = await this.fetchHardLinkedEntities(
        id,
        linksEntries
          .filter(([_, link]) => link.class === 'H5L_TYPE_HARD')
          .map(([title]) => title),
      );

      return {
        ...hsdsGroup,
        children: linksEntries.map(([name, link]) => {
          const childPath = buildEntityPath(path, name);

          if (link.class === 'H5L_TYPE_HARD') {
            assertDefined(hardLinkedChildren[name]);
            return convertHsdsEntity(childPath, hardLinkedChildren[name]);
          }

          return {
            name: link.title,
            path: childPath,
            kind: EntityKind.Unresolved,
            attributes: [],
            link: convertHsdsSymbolicLink(link),
          };
        }),
      };
    }

    return convertHsdsEntity(path, response);
  }

  public override async getValue(
    dataset: Dataset<ScalarShape | ArrayShape>,
    selection?: string,
    abortSignal?: AbortSignal,
    onProgress?: OnProgress,
  ): Promise<unknown> {
    assertHsdsDataset(dataset);

    const { id, type } = dataset;

    const url = `${this.baseURL}/datasets/${id}/value`;
    const baseOpts = { abortSignal, onProgress };
    const params = {
      domain: this.domain,
      ...(selection && { select: `[${selection}]` }),
    };

    try {
      if (type.class === DTypeClass.Opaque) {
        const buffer = await this.fetcher(url, params, {
          ...baseOpts,
          headers: { Accept: 'application/octet-stream' },
        });

        return new Uint8Array(buffer);
      }

      const DTypedArray =
        typedArrayFromDType(type) || bigIntTypedArrayFromDType(type);

      if (DTypedArray) {
        const buffer = await this.fetcher(url, params, {
          ...baseOpts,
          headers: { Accept: 'application/octet-stream' },
        });

        const array = new DTypedArray(buffer);
        return hasScalarShape(dataset) ? array[0] : array;
      }

      const buffer = await this.fetcher(url, params, baseOpts);
      const { value } = toExtendedJSON(buffer) as HsdsValueResponse;

      if (hasScalarShape(dataset)) {
        return value;
      }

      // HSDS doesn't reduce the number of dimensions correctly when slicing
      // https://github.com/HDFGroup/hsds/issues/88
      assertArray(value);
      const flattened = value.flat(dataset.shape.dims.length - 1);

      return selection && isScalarSelection(selection)
        ? flattened[0] // unwrap scalar slice from flattened array
        : flattened;
    } catch (error) {
      throw this.wrapHsdsError(error) || error;
    }
  }

  public override async getAttrValues(
    entity: Entity,
  ): Promise<AttributeValues> {
    assertHsdsEntity(entity);

    const { id, collection, attributes } = entity;
    if (attributes.length === 0) {
      return {};
    }

    const attrs = await this.fetchAttributesWithValues(id, collection);
    return Object.fromEntries(attrs.map((attr) => [attr.name, attr.value]));
  }

  public override getExportURL(
    format: ExportFormat,
    dataset: Dataset<ArrayShape>,
    selection?: string,
    builtInExporter?: BuiltInExporter,
  ): ExportURL | undefined {
    const url = this._getExportURL?.(
      format,
      dataset,
      selection,
      builtInExporter,
    );

    if (url) {
      return url;
    }

    if (!builtInExporter) {
      return undefined;
    }

    return async () => new Blob([builtInExporter()]);
  }

  private async fetchEntity(path: string): Promise<HsdsEntityResponse> {
    try {
      const buffer = await this.fetcher(`${this.baseURL}/`, {
        domain: this.domain,
        h5path: path,
        include_links: 'true',
        include_attrs: 'true',
      });

      return toJSON(buffer) as HsdsEntityResponse;
    } catch (error) {
      throw this.wrapHsdsError(error) || error;
    }
  }

  private async fetchHardLinkedEntities(
    parentId: string,
    linkNames: string[],
  ): Promise<HsdsEntitiesResponse['h5paths']> {
    try {
      const buffer = await this.fetcher(
        `${this.baseURL}/`,
        {
          domain: this.domain,
          parent_id: parentId,
          include_attrs: 'true',
        },
        {
          method: 'POST',
          body: JSON.stringify({ h5paths: linkNames }),
        },
      );

      return (toJSON(buffer) as HsdsEntitiesResponse).h5paths;
    } catch (error) {
      throw this.wrapHsdsError(error) || error;
    }
  }

  private async fetchAttributesWithValues(
    entityId: HsdsId,
    entityCollection: HsdsCollection,
  ): Promise<HsdsAttributesWithValuesResponse['attributes']> {
    try {
      const buffer = await this.fetcher(
        `${this.baseURL}/${entityCollection}/${entityId}/attributes`,
        {
          domain: this.domain,
          IncludeData: 'true',
        },
      );

      return (toExtendedJSON(buffer) as HsdsAttributesWithValuesResponse)
        .attributes;
    } catch (error) {
      throw this.wrapHsdsError(error) || error;
    }
  }

  private wrapHsdsError(error: unknown): Error | undefined {
    if (error instanceof FetcherError && error.status === 404) {
      return new Error(`File not found: ${this.domain}`, { cause: error });
    }

    return undefined;
  }
}
