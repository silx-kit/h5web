import { assertArray, hasScalarShape } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type AttributeValues,
  type Dataset,
  type Datatype,
  DTypeClass,
  type Entity,
  EntityKind,
  type Group,
  type GroupWithChildren,
  type ScalarShape,
  type UnresolvedEntity,
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
  type HsdsEntitiesResponse,
  type HsdsEntity,
  type HsdsEntityResponse,
  type HsdsGroupResponse,
  type HsdsValueResponse,
} from './models';
import { assertHsdsEntity, parseEntity, toExtendedJSON } from './utils';

export class HsdsApi extends DataProviderApi {
  /* API compatible with hsds@1.0.2 */
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
  ): Promise<
    HsdsEntity<Awaited<ReturnType<HsdsApi['getGroup']>> | Dataset | Datatype>
  > {
    const response = await this.fetchEntity(path);

    if (response.class === 'group') {
      return this.getGroup(path, response);
    }

    return parseEntity(path, response);
  }

  public override async getValue(
    dataset: Dataset<ScalarShape | ArrayShape>,
    selection?: string,
    abortSignal?: AbortSignal,
    onProgress?: OnProgress,
  ): Promise<unknown> {
    assertHsdsEntity(dataset);
    const { id, domain, type } = dataset;

    const url = `${this.baseURL}/datasets/${id}/value`;
    const baseOpts = { abortSignal, onProgress };
    const params = { domain, ...(selection && { select: `[${selection}]` }) };

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
      throw this.wrapHsdsError(error, domain) || error;
    }
  }

  public override async getAttrValues(
    entity: Entity,
  ): Promise<AttributeValues> {
    assertHsdsEntity(entity);

    if (entity.kind === EntityKind.Unresolved) {
      throw new Error('Expected resolved entity');
    }

    if (entity.attributes.length === 0) {
      return {};
    }

    const attrs = await this.fetchAttributesWithValues(entity);
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

  private async getGroup(
    path: string,
    response: HsdsGroupResponse,
  ): Promise<
    HsdsEntity<
      GroupWithChildren<
        HsdsEntity<Group | Dataset | Datatype> | UnresolvedEntity
      >
    >
  > {
    const hsdsGroup = parseEntity(path, response);

    const { id, links } = response;
    const linksEntries = Object.entries(links).sort(
      (a, b) => a[0].localeCompare(b[0]), // `GET /` with `include_links` doesn't sort links predictably
    );

    const hardLinksEntries = linksEntries.filter(
      ([_, link]) => link.class === 'H5L_TYPE_HARD',
    );
    const symLinksEntries = linksEntries.filter(
      ([_, link]) => link.class !== 'H5L_TYPE_HARD',
    );

    const hardLinksResponses = await this.fetchHardLinks(
      id,
      hardLinksEntries.map(([name]) => name),
    );

    // Fetch soft and external links individually so that one broken link doesn't affect the others
    const symLinksResponses = Object.fromEntries(
      await Promise.all(
        symLinksEntries.map(async ([name]) => {
          const childPath = buildEntityPath(path, name);
          return [name, await this.fetchSymbolicLink(childPath)] as const;
        }),
      ),
    );

    const childrenResponses = { ...hardLinksResponses, ...symLinksResponses };
    return {
      ...hsdsGroup,
      children: linksEntries.map(([name, hsdsLink]) => {
        const childPath = buildEntityPath(path, name);
        const childResponse = Object.hasOwn(childrenResponses, name)
          ? childrenResponses[name]
          : undefined;

        return parseEntity(childPath, childResponse, hsdsLink);
      }),
    };
  }

  private async fetchEntity(path: string): Promise<HsdsEntityResponse> {
    try {
      const buffer = await this.fetcher(`${this.baseURL}/`, {
        domain: this.domain,
        h5path: path,
        include_links: 'true',
        include_attrs: 'true',
        follow_external_links: 'true',
        follow_soft_links: 'true',
      });

      return toJSON(buffer) as HsdsEntityResponse;
    } catch (error) {
      throw this.wrapHsdsError(error) || error;
    }
  }

  private async fetchHardLinks(
    parentId: string,
    names: string[],
  ): Promise<Record<string, HsdsEntityResponse>> {
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
          body: JSON.stringify({ h5paths: names }),
        },
      );

      return (toJSON(buffer) as HsdsEntitiesResponse).h5paths;
    } catch (error) {
      throw this.wrapHsdsError(error) || error;
    }
  }

  private async fetchSymbolicLink(
    path: string,
  ): Promise<HsdsEntityResponse | undefined> {
    try {
      const buffer = await this.fetcher(`${this.baseURL}/`, {
        domain: this.domain,
        h5path: path,
        include_attrs: 'true',
        follow_external_links: 'true',
        follow_soft_links: 'true',
      });

      return toJSON(buffer) as HsdsEntityResponse;
    } catch (error) {
      if (
        error instanceof FetcherError &&
        (error.status === 404 || error.status === 500) // 500 with relative domain: https://github.com/HDFGroup/hsds/issues/488
      ) {
        // Don't throw on broken soft/external links so they can be shown as unresolved
        return undefined;
      }

      throw error;
    }
  }

  private async fetchAttributesWithValues(
    entity: HsdsEntity,
  ): Promise<HsdsAttributesWithValuesResponse['attributes']> {
    const { id, domain, kind } = entity;

    try {
      const buffer = await this.fetcher(
        `${this.baseURL}/${kind}s/${id}/attributes`,
        { domain, IncludeData: 'true' },
      );

      return (toExtendedJSON(buffer) as HsdsAttributesWithValuesResponse)
        .attributes;
    } catch (error) {
      throw this.wrapHsdsError(error) || error;
    }
  }

  private wrapHsdsError(
    error: unknown,
    domain = this.domain,
  ): Error | undefined {
    if (error instanceof FetcherError && error.status === 404) {
      return new Error(`Domain not found: ${domain}`, { cause: error });
    }

    return undefined;
  }
}
