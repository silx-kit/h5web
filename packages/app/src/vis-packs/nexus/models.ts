import type {
  ArrayShape,
  ArrayValue,
  ComplexType,
  Dataset,
  NumArray,
  NumArrayDataset,
  NumericType,
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
  signal: ArrayValue<T>;
  signalLabel: string;
  errors?: NumArray;
  axisMapping: AxisMapping;
  auxiliaries?: Auxiliary[];
  title: string;
}

export type AxisDatasetMapping = (NumArrayDataset | undefined)[];

export interface SilxStyle {
  signalScaleType?: ScaleType;
  axisScaleTypes?: ScaleType[];
}

export interface Auxiliary {
  label: string;
  value: NumArray;
}
