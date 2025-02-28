import {
  type ArrayShape,
  type AttributeValues,
  type Dataset,
  type Entity,
  type ProvidedEntity,
  type ScalarShape,
} from '@h5web/shared/hdf5-models';
import { type FetchStore } from '@h5web/shared/react-suspense-fetch';

import { type NxAttribute } from '../vis-packs/nexus/models';

export type EntitiesStore = FetchStore<string, ProvidedEntity>;
export type ValuesStore = FetchStore<ValuesStoreParams, unknown>;

export interface ValuesStoreParams {
  dataset: Dataset<ScalarShape | ArrayShape>;
  selection?: string | undefined;
}

export interface AttrValuesStore extends FetchStore<Entity, AttributeValues> {
  getSingle: (entity: Entity, attrName: AttrName) => unknown;
}

export type ImageAttribute = 'CLASS' | 'IMAGE_SUBCLASS';
export type AttrName = NxAttribute | ImageAttribute | '_FillValue';

export type ProgressCallback = (prog: number[]) => void;
