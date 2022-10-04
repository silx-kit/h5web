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

export type AuxDatasets = {
  signal: NumArrayDataset;
  errors?: NumArrayDataset;
}[];

export interface NxData<
  T extends NumericType | ComplexType = NumericType | ComplexType
> {
  signalDataset: Dataset<ArrayShape, T>;
  errorDataset?: NumArrayDataset;
  axisDatasets: AxisMapping<NumArrayDataset>;
  axisLabels: AxisMapping<string>;
  auxDatasets: AuxDatasets;
  titleDataset?: Dataset<ScalarShape, StringType>;
  silxStyle: SilxStyle;
}

export interface NxValues<T extends NumericType | ComplexType> {
  signal: ArrayValue<T>;
  signalLabel: string;
  errors?: NumArray;
  axisValues: AxisMapping<NumArray>;
  auxiliaries?: Auxiliary[];
  title: string;
}

export type AxisMapping<T> = (T | undefined)[];

export interface SilxStyle {
  signalScaleType?: ScaleType;
  axisScaleTypes?: AxisMapping<ScaleType>;
}

export interface Auxiliary {
  label: string;
  values: NumArray;
  errors?: NumArray;
}
