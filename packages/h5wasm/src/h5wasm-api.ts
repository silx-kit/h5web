import type { ExportFormat, ExportURL, ValuesStoreParams } from '@h5web/app';
import { DataProviderApi } from '@h5web/app';
import { assertDataset, isDefined } from '@h5web/shared/guards';
import type {
  ArrayShape,
  AttributeValues,
  Dataset,
  Entity,
  ProvidedEntity,
  Value,
} from '@h5web/shared/hdf5-models';
import { transfer } from 'comlink';

import type { Plugin } from './models';
import {
  getEnhancedError,
  hasBigInts,
  PLUGINS_BY_FILTER_ID,
  sanitizeBigInts,
} from './utils';
import type { H5WasmWorkerAPI } from './worker';

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
    return this.remote.getEntity(await this.fileId, path);
  }

  public override async getValue(params: ValuesStoreParams): Promise<unknown> {
    const { dataset, selection } = params;
    const fileId = await this.fileId;

    await this.processFilters(dataset);

    try {
      const value = await this.remote.getValue(fileId, dataset.path, selection);
      return hasBigInts(dataset.type) ? sanitizeBigInts(value) : value;
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

  public override getExportURL<D extends Dataset<ArrayShape>>(
    format: ExportFormat,
    dataset: D,
    selection: string | undefined,
    value: Value<D>,
  ): ExportURL {
    const url = this._getExportURL?.(format, dataset, selection, value);
    if (url) {
      return url;
    }

    if (format === 'json') {
      return async () => new Blob([JSON.stringify(value, null, 2)]);
    }

    return undefined;
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
        ({ path }) => this.remote.getEntity(fileId, path),
      ),
    );
    const allFilters = [dataset, ...localSources].flatMap((source) => {
      assertDataset(source);
      return source.filters || [];
    });

    const pluginsToLoad = allFilters
      .map(({ id }) => PLUGINS_BY_FILTER_ID[id])
      .filter(isDefined);

    for await (const plugin of pluginsToLoad) {
      if (await this.remote.isPluginLoaded(plugin)) {
        continue; // plugin already loaded
      }

      const buffer = await this.getPlugin?.(plugin);
      if (!buffer) {
        // eslint-disable-next-line no-console
        console.warn(`Compression plugin ${plugin} not available`);
        continue;
      }

      await this.remote.loadPlugin(plugin, transfer(buffer, [buffer]));
    }
  }
}
