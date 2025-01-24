import { type AxisScaleType, type ColorScaleType } from '@h5web/lib';
import {
  type ArrayShape,
  type ArrayValue,
  type ComplexType,
  type Dataset,
  type NumericLikeType,
  type NumericType,
  type ScalarShape,
  type StringType,
} from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';
import { type NumArray } from '@h5web/shared/vis-models';

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

export interface DatasetInfo {
  label: string;
  unit: string | undefined;
}

export interface DatasetDef<
  T extends NumericLikeType | ComplexType = NumericLikeType | ComplexType,
> extends DatasetInfo {
  dataset: Dataset<ArrayShape, T>;
}

type WithError<T extends DatasetDef> = T & {
  errorDataset?: Dataset<ArrayShape, NumericType>;
};

export type AxisDef = DatasetDef<NumericType>;

export interface SilxStyle {
  signalScaleType?: ColorScaleType;
  axisScaleTypes?: AxisMapping<AxisScaleType>;
}

export interface NxData<
  T extends NumericLikeType | ComplexType = NumericLikeType | ComplexType,
> {
  titleDataset?: Dataset<ScalarShape, StringType>;
  signalDef: WithError<DatasetDef<T>>;
  auxDefs: WithError<DatasetDef<T>>[];
  axisDefs: AxisMapping<AxisDef>;
  silxStyle: SilxStyle;
}

export interface NxValues<T extends NumericLikeType | ComplexType> {
  title: string;
  signal: ArrayValue<T>;
  errors?: NumArray;
  auxValues: ArrayValue<T>[];
  auxErrors: (NumArray | undefined)[];
  axisValues: AxisMapping<NumArray>;
}
