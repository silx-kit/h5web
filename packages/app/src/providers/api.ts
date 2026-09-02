import {
  type AttributeValues,
  type Dataset,
  type DimensionScales,
  type Entity,
  type ProvidedEntity,
} from '@h5web/shared/hdf5-models';
import { type OnProgress } from '@h5web/shared/react-suspense-fetch';
import {
  type BuiltInExporter,
  type ExportFormat,
  type ExportURL,
} from '@h5web/shared/vis-models';

import { type ValuesStoreParams } from './models';

export abstract class DataProviderApi {
  public constructor(public readonly filepath: string) {}

  public abstract getEntity(path: string): Promise<ProvidedEntity>;

  public abstract getValue(
    params: ValuesStoreParams,
    abortSignal?: AbortSignal,
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
  public getExportURL?( // optional, so can't be abstract
    format: ExportFormat,
    dataset: Dataset,
    selection?: string,
    builtInExporter?: BuiltInExporter,
  ): ExportURL | undefined;

  public getSearchablePaths?(path: string): Promise<string[]>; // optional, so can't be abstract

  /**
   * Provide the labels and attached scale datasets of a dataset's dimensions,
   * as defined by the HDF5 dimension scales specification. Providers that
   * cannot resolve dimension scales should leave this method undefined, in
   * which case datasets are plotted against their indices as before.
   */
  public getDimensionScales?(dataset: Dataset): Promise<DimensionScales>; // optional, so can't be abstract
}
