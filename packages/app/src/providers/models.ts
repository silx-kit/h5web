import {
  type ArrayShape,
  type Dataset,
  type ScalarShape,
} from '@h5web/shared/hdf5-models';

export interface ValuesStoreParams {
  dataset: Dataset<ScalarShape | ArrayShape>;
  selection?: string | undefined; // if omitted or `undefined`, provider should return the full dataset
}

export type Fetcher = (
  url: string,
  params: Record<string, string>,
  opts?: FetcherOptions,
) => Promise<ArrayBuffer>;

export interface FetcherOptions {
  abortSignal?: AbortSignal;
  onProgress?: OnProgress;
}

export type OnProgress = (value: number) => void;
