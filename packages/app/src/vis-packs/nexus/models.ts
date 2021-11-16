import type {
  ArrayShape,
  ComplexType,
  Dataset,
  NumArrayDataset,
  NumericType,
  Primitive,
  ScalarShape,
  ScaleType,
  StringType,
} from '@h5web/shared';

import type { AxisMapping } from '../core/models';

export type NxAttribute =
  | 'NX_class'
  | 'signal'
  | 'interpretation'
  | 'axes'
  | 'default'
  | 'long_name'
  | 'units'
  | 'SILX_style'
  | 'auxiliary_signals';

export interface NxData<
  T extends NumericType | ComplexType = NumericType | ComplexType
> {
  signalDataset: Dataset<ArrayShape, T>;
  errorsDataset?: NumArrayDataset;
  axisDatasets: AxisDatasetMapping;
  auxDatasets: NumArrayDataset[];
  titleDataset?: Dataset<ScalarShape, StringType>;
  silxStyle: SilxStyle;
}

export interface NxValues<T extends NumericType | ComplexType> {
  signal: Primitive<T>[];
  errors?: number[];
  axisMapping: AxisMapping;
  auxiliaries?: number[][];
  title?: string;
}

export type AxisDatasetMapping = (NumArrayDataset | undefined)[];

export interface SilxStyle {
  signalScaleType?: ScaleType;
  axisScaleTypes?: ScaleType[];
}
