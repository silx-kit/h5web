import {
  assertDefined,
  assertGroup,
  hasArrayShape,
} from '@h5web/shared/guards';
import {
  type ArrayShape,
  type AttributeValues,
  type ChildEntity,
  type Dataset,
  type Datatype,
  type Entity,
  EntityKind,
  type Group,
  type GroupWithChildren,
  type ProvidedEntity,
} from '@h5web/shared/hdf5-models';
import { buildEntityPath, getChildEntity } from '@h5web/shared/hdf5-utils';
import { type OnProgress } from '@h5web/shared/react-suspense-fetch';
import {
  type BuiltInExporter,
  type ExportFormat,
  type ExportURL,
} from '@h5web/shared/vis-models';

import { DataProviderApi } from '../api';
import { type Fetcher, type ValuesStoreParams } from '../models';
import { FetcherError, toJSON } from '../utils';
import {
  type BaseHsdsEntity,
  type HsdsAttribute,
  type HsdsAttributesResponse,
  type HsdsAttributeWithValueResponse,
  type HsdsCollection,
  type HsdsDatasetResponse,
  type HsdsDatatypeResponse,
  type HsdsEntity,
  type HsdsGroupResponse,
  type HsdsId,
  type HsdsLink,
  type HsdsLinksResponse,
  type HsdsRootResponse,
  type HsdsValueResponse,
} from './models';
import {
  assertHsdsDataset,
  assertHsdsEntity,
  convertHsdsAttributes,
  convertHsdsShape,
  convertHsdsType,
  flattenValue,
  isHsdsGroup,
  toExtendedJSON,
} from './utils';

export class HsdsApi extends DataProviderApi {
  private readonly entities = new Map<string, HsdsEntity<ProvidedEntity>>();

  /* API compatible with HSDS@6717a7bb8c2245492090be34ec3ccd63ecb20b70 */
  public constructor(
    private readonly baseURL: string,
    filepath: string,
    private readonly fetcher: Fetcher,
    private readonly _getExportURL?: DataProviderApi['getExportURL'],
  ) {
    super(filepath);
  }

  public override async getEntity(
    path: string,
  ): Promise<HsdsEntity<ProvidedEntity>> {
    const cachedEntity = this.entities.get(path);
    if (cachedEntity) {
      return cachedEntity;
    }

    if (path === '/') {
      const rootId = await this.fetchRootId();
      const root = await this.processGroup({
        id: rootId,
        collection: 'groups',
        path: '/',
        name: this.filepath,
      });

      this.entities.set(path, root);
      return root;
    }

    /* HSDS doesn't allow fetching entities by path.
     * We need to fetch every ascendant group right up to the root group
     * in order to find the ID of the entity at the requested path.
     * Entities are cached along the way for efficiency. */
    const parentPath = path.slice(0, path.lastIndexOf('/')) || '/';
    const parentGroup = await this.getEntity(parentPath);
    assertGroup(parentGroup);

    const childName = path.slice(path.lastIndexOf('/') + 1);
    const child = getChildEntity(parentGroup, childName);
    assertDefined(child, `No entity found at ${path}`);
    assertHsdsEntity(child);

    const entity = isHsdsGroup(child)
      ? await this.processGroup({ ...child, path })
      : child;

    this.entities.set(path, entity);
    return entity;
  }

  public override async getValue(
    params: ValuesStoreParams,
    abortSignal?: AbortSignal,
    onProgress?: OnProgress,
  ): Promise<unknown> {
    const { dataset } = params;
    assertHsdsDataset(dataset);

    const value = await this.fetchValue(
      dataset.id,
      params.selection,
      abortSignal,
      onProgress,
    );

    /* HSDS doesn't reduce the number of dimensions when selecting indices,
     * so the flattening must be done on all dimensions regardless of the selection.
     * https://github.com/HDFGroup/hsds/issues/88 */
    return hasArrayShape(dataset) ? flattenValue(value, dataset) : value;
  }

  public override async getAttrValues(
    entity: Entity,
  ): Promise<AttributeValues> {
    assertHsdsEntity(entity);

    const { id, collection, attributes } = entity;
    if (attributes.length === 0) {
      return {};
    }

    const attrsPromises = attributes.map(async (attr) =>
      this.fetchAttributeWithValue(collection, id, attr.name),
    );

    const attrsWithValues = await Promise.all(attrsPromises);
    return Object.fromEntries(
      attrsWithValues.map((attr) => [attr.name, attr.value]),
    );
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

  private async fetchRootId(): Promise<HsdsId> {
    try {
      const buffer = await this.fetcher(`${this.baseURL}/`, {
        domain: this.filepath,
      });

      return (toJSON(buffer) as HsdsRootResponse).root;
    } catch (error) {
      throw this.wrapHsdsError(error) || error;
    }
  }

  private async fetchDataset(id: HsdsId): Promise<HsdsDatasetResponse> {
    try {
      const buffer = await this.fetcher(`${this.baseURL}/datasets/${id}`, {
        domain: this.filepath,
      });

      return toJSON(buffer) as HsdsDatasetResponse;
    } catch (error) {
      throw this.wrapHsdsError(error) || error;
    }
  }

  private async fetchDatatype(id: HsdsId): Promise<HsdsDatatypeResponse> {
    try {
      const buffer = await this.fetcher(`${this.baseURL}/datatypes/${id}`, {
        domain: this.filepath,
      });

      return toJSON(buffer) as HsdsDatatypeResponse;
    } catch (error) {
      throw this.wrapHsdsError(error) || error;
    }
  }

  private async fetchGroup(id: HsdsId): Promise<HsdsGroupResponse> {
    try {
      const buffer = await this.fetcher(`${this.baseURL}/groups/${id}`, {
        domain: this.filepath,
      });

      return toJSON(buffer) as HsdsGroupResponse;
    } catch (error) {
      throw this.wrapHsdsError(error) || error;
    }
  }

  private async fetchLinks(id: HsdsId): Promise<HsdsLink[]> {
    try {
      const buffer = await this.fetcher(`${this.baseURL}/groups/${id}/links`, {
        domain: this.filepath,
      });

      return (toJSON(buffer) as HsdsLinksResponse).links;
    } catch (error) {
      throw this.wrapHsdsError(error) || error;
    }
  }

  private async fetchAttributes(
    entityCollection: HsdsCollection,
    entityId: HsdsId,
  ): Promise<HsdsAttribute[]> {
    try {
      const buffer = await this.fetcher(
        `${this.baseURL}/${entityCollection}/${entityId}/attributes`,
        { domain: this.filepath },
      );

      return (toJSON(buffer) as HsdsAttributesResponse).attributes;
    } catch (error) {
      throw this.wrapHsdsError(error) || error;
    }
  }

  private async fetchValue(
    entityId: HsdsId,
    selection?: string,
    abortSignal?: AbortSignal,
    onProgress?: OnProgress,
  ): Promise<unknown> {
    try {
      const buffer = await this.fetcher(
        `${this.baseURL}/datasets/${entityId}/value`,
        {
          domain: this.filepath,
          ...(selection && { select: `[${selection}]` }),
        },
        { abortSignal, onProgress },
      );

      return (toExtendedJSON(buffer) as HsdsValueResponse).value;
    } catch (error) {
      throw this.wrapHsdsError(error) || error;
    }
  }

  private async fetchAttributeWithValue(
    entityCollection: HsdsCollection,
    entityId: HsdsId,
    attributeName: string,
  ): Promise<HsdsAttributeWithValueResponse> {
    try {
      const buffer = await this.fetcher(
        `${this.baseURL}/${entityCollection}/${entityId}/attributes/${attributeName}`,
        { domain: this.filepath },
      );

      return toExtendedJSON(buffer) as HsdsAttributeWithValueResponse;
    } catch (error) {
      throw this.wrapHsdsError(error) || error;
    }
  }

  private async resolveLink(
    link: HsdsLink,
    path: string,
  ): Promise<ChildEntity> {
    if (link.class !== 'H5L_TYPE_HARD') {
      return {
        name: link.title,
        path,
        kind: EntityKind.Unresolved,
        attributes: [],
        link: {
          class: link.class === 'H5L_TYPE_SOFT' ? 'Soft' : 'External',
          path: link.h5path,
          file: link.file,
        },
      };
    }

    const { id, title, collection } = link;
    const baseEntity: BaseHsdsEntity = { id, collection, path, name: title };

    switch (collection) {
      case 'groups':
        return this.processGroup(baseEntity, true);
      case 'datasets':
        return this.processDataset(baseEntity);
      case 'datatypes':
        return this.processDatatype(baseEntity);
      default:
        throw new Error('Unknown collection !');
    }
  }

  private async processGroup(
    baseEntity: BaseHsdsEntity,
    isChild: true,
  ): Promise<HsdsEntity<Group>>;

  private async processGroup(
    baseEntity: BaseHsdsEntity,
    isChild?: false,
  ): Promise<HsdsEntity<GroupWithChildren>>;

  private async processGroup(
    baseEntity: BaseHsdsEntity,
    isChild = false,
  ): Promise<HsdsEntity<Group | GroupWithChildren>> {
    const { id, path } = baseEntity;
    const { attributeCount, linkCount } = await this.fetchGroup(id);

    // Fetch attributes and links in parallel
    const [attributes, links] = await Promise.all([
      attributeCount > 0
        ? this.fetchAttributes('groups', id)
        : Promise.resolve([]),
      linkCount > 0 && !isChild ? this.fetchLinks(id) : Promise.resolve([]),
    ]);

    const group: HsdsEntity<Group> = {
      ...baseEntity,
      kind: EntityKind.Group,
      attributes: convertHsdsAttributes(attributes),
    };

    if (isChild) {
      return group; // don't fetch nested group's children
    }

    return {
      ...group,
      children: await Promise.all(
        links.map(async (link) =>
          this.resolveLink(link, buildEntityPath(path, link.title)),
        ),
      ),
    };
  }

  private async processDataset(
    baseEntity: BaseHsdsEntity,
  ): Promise<HsdsEntity<Dataset>> {
    const { id } = baseEntity;
    const dataset = await this.fetchDataset(id);
    const { shape, type, attributeCount } = dataset;

    const attributes =
      attributeCount > 0 ? await this.fetchAttributes('datasets', id) : [];

    return {
      ...baseEntity,
      kind: EntityKind.Dataset,
      attributes: convertHsdsAttributes(attributes),
      shape: convertHsdsShape(shape),
      type: convertHsdsType(type),
      rawType: type,
    };
  }

  private async processDatatype(
    baseEntity: BaseHsdsEntity,
  ): Promise<HsdsEntity<Datatype>> {
    const { id } = baseEntity;
    const { type } = await this.fetchDatatype(id);

    return {
      ...baseEntity,
      kind: EntityKind.Datatype,
      attributes: [],
      type: convertHsdsType(type),
      rawType: type,
    };
  }

  private wrapHsdsError(error: unknown): Error | undefined {
    if (error instanceof FetcherError && error.status === 400) {
      return new Error(`File not found: ${this.filepath}`, { cause: error });
    }

    return undefined;
  }
}
