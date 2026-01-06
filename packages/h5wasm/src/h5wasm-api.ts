import { DataProviderApi, type ValuesStoreParams } from '@h5web/app';
import { assertDataset, isDefined } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type AttributeValues,
  type Dataset,
  type Entity,
  type ProvidedEntity,
} from '@h5web/shared/hdf5-models';
import {
  type BuiltInExporter,
  type ExportFormat,
  type ExportURL,
} from '@h5web/shared/vis-models';
import { transfer } from 'comlink';

import { type Plugin } from './models';
import { getEnhancedError, PLUGINS_BY_FILTER_ID } from './utils';
import { type H5WasmWorkerAPI } from './worker';

export class H5WasmApi extends DataProviderApi {
  public constructor(
    private readonly remote: H5WasmWorkerAPI,
    fileName: string,
    private readonly fileId: Promise<bigint>,
    private readonly _getExportURL?: DataProviderApi['getExportURL'],
    private readonly getPlugin?: (
      name: Plugin,
    ) => Promise<ArrayBuffer | undefined>,
  ) {
    super(fileName);
  }

  public override async getEntity(path: string): Promise<ProvidedEntity> {
    try {
      return await this.remote.getEntity(await this.fileId, path);
    } catch (error) {
      throw getEnhancedError(error);
    }
  }

  public override async getValue(params: ValuesStoreParams): Promise<unknown> {
    const { dataset, selection } = params;
    const fileId = await this.fileId;

    await this.processFilters(dataset);

    try {
      return await this.remote.getValue(fileId, dataset.path, selection);
    } catch (error) {
      throw getEnhancedError(error);
    }
  }

  public override async getAttrValues(
    entity: Entity,
  ): Promise<AttributeValues> {
    const fileId = await this.fileId;

    return Object.fromEntries(
      await Promise.all(
        entity.attributes.map<Promise<[string, unknown]>>(async ({ name }) => [
          name,
          await this.remote.getAttrValue(fileId, entity.path, name),
        ]),
      ),
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

  public override async getSearchablePaths(root: string): Promise<string[]> {
    const fileId = await this.fileId;
    return this.remote.getDescendantPaths(fileId, root);
  }

  public async cleanUp(): Promise<number> {
    return this.remote.closeFile(await this.fileId);
  }

  private async processFilters(dataset: Dataset): Promise<void> {
    const fileId = await this.fileId;

    // Retrieve filters of any local virtual source datasets
    const localSources = await Promise.all(
      (dataset.virtualSources?.filter(({ file }) => file === '.') || []).map(
        async ({ path }) => this.remote.getEntity(fileId, path),
      ),
    );
    const allFilters = [dataset, ...localSources].flatMap((source) => {
      assertDataset(source);
      return source.filters || [];
    });

    // Load corresponding plugins
    await Promise.all(
      allFilters
        .map(({ id }) => PLUGINS_BY_FILTER_ID[id])
        .filter(isDefined)
        .map(this.loadPlugin.bind(this)),
    );
  }

  private async loadPlugin(plugin: Plugin): Promise<void> {
    if (await this.remote.isPluginLoaded(plugin)) {
      return; // plugin already loaded
    }

    const buffer = await this.getPlugin?.(plugin);
    if (!buffer) {
      // eslint-disable-next-line no-console
      console.warn(`Compression plugin ${plugin} not available`);
      return;
    }

    await this.remote.loadPlugin(plugin, transfer(buffer, [buffer]));
  }
}
