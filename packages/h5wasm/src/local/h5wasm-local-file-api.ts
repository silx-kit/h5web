import type { ExportFormat, ExportURL, ValuesStoreParams } from '@h5web/app';
import { DataProviderApi } from '@h5web/app';
import type {
  ArrayShape,
  AttributeValues,
  Dataset,
  Entity,
  ProvidedEntity,
  Value,
} from '@h5web/shared/hdf5-models';
import type { Remote } from 'comlink';

import type { Plugin } from '../models';
import { getEnhancedError, hasBigInts, sanitizeBigInts } from '../utils';
import { getH5WasmRemote } from './remote';
import type { H5WasmWorkerAPI } from './worker';

export class H5WasmLocalFileApi extends DataProviderApi {
  private readonly remote: Remote<H5WasmWorkerAPI>;
  private readonly fileId: Promise<bigint>;

  public constructor(
    file: File,
    private readonly _getExportURL?: DataProviderApi['getExportURL'],
  ) {
    super(file.name);

    this.remote = getH5WasmRemote();
    this.fileId = this.remote.openFile(file);
  }

  public override async getEntity(path: string): Promise<ProvidedEntity> {
    return this.remote.getEntity(await this.fileId, path);
  }

  public override async getValue(params: ValuesStoreParams): Promise<unknown> {
    const { dataset, selection } = params;
    const fileId = await this.fileId;

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

  public async cleanUp(): Promise<number> {
    return this.remote.closeFile(await this.fileId);
  }
}
