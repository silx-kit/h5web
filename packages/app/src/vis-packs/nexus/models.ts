import type {
  AnyArray,
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

export enum NxInterpretation {
  Spectrum = 'spectrum',
  Image = 'image',
  RGB = 'rgb-image',
}

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
  signal: AnyArray<Primitive<T>>;
  errors?: AnyArray<number>;
  axisMapping: AxisMapping;
  auxiliaries?: AnyArray<number>[];
  title?: string;
}

export type AxisDatasetMapping = (NumArrayDataset | undefined)[];

export interface SilxStyle {
  signalScaleType?: ScaleType;
  axisScaleTypes?: ScaleType[];
}
