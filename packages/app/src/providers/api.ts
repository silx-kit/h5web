/* eslint-disable @typescript-eslint/member-ordering */
import {
  type ArrayShape,
  type AttributeValues,
  type Dataset,
  type Entity,
  type ProvidedEntity,
  type Value,
} from '@h5web/shared/hdf5-models';
import { type OnProgress } from '@h5web/shared/react-suspense-fetch';

import {
  type ExportFormat,
  type ExportURL,
  type ValuesStoreParams,
} from './models';

export abstract class DataProviderApi {
  public constructor(public readonly filepath: string) {}

  public abstract getEntity(path: string): Promise<ProvidedEntity>;

  public abstract getValue(
    params: ValuesStoreParams,
    signal?: AbortSignal,
    onProgress?: OnProgress,
  ): Promise<unknown>;

  public abstract getAttrValues(entity: Entity): Promise<AttributeValues>;

  /**
   * Provide an export URL for the given format and dataset/slice.
   * The following return types are supported:
   * - `URL`                  Provider has dedicated endpoint for generating server-side exports
   * - `() => Promise<URL>`   Provider generates single-use export URLs (i.e. signed one-time tokens)
   * - `() => Promise<Blob>`  Export is generated client-side
   * - `undefined`            Export scenario is not supported
   */
  public getExportURL?<D extends Dataset<ArrayShape>>( // optional, so can't be abstract
    format: ExportFormat,
    dataset: D,
    selection: string | undefined,
    value: Value<D>,
  ): ExportURL;

  public getSearchablePaths?(path: string): Promise<string[]>; // optional, so can't be abstract
}
