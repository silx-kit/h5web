import {
  type ArrayShape,
  type AttributeValues,
  type Dataset,
  type Entity,
  type ProvidedEntity,
  type ScalarShape,
} from '@h5web/shared/hdf5-models';
import {
  type FetchStore,
  type OnProgress,
} from '@h5web/shared/react-suspense-fetch';

import { type NxAttribute } from '../vis-packs/nexus/models';

export type EntitiesStore = FetchStore<string, ProvidedEntity>;
export type ValuesStore = FetchStore<ValuesStoreParams, unknown>;
export type AttrValuesStore = FetchStore<Entity, AttributeValues>;

export interface ValuesStoreParams {
  dataset: Dataset<ScalarShape | ArrayShape>;
  selection?: string | undefined;
}

export type ImageAttribute = 'CLASS' | 'IMAGE_SUBCLASS';
export type AttrName = NxAttribute | ImageAttribute | '_FillValue';

export type ProgressCallback = (prog: number[]) => void;

export type Fetcher = (
  url: string,
  params: Record<string, string>,
  opts?: FetcherOptions,
) => Promise<ArrayBuffer>;

export interface FetcherOptions {
  abortSignal?: AbortSignal;
  onProgress?: OnProgress;
}
