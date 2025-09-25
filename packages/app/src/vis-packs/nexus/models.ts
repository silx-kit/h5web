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

export type NxAttribute =
  | 'NX_class'
  | 'signal'
  | 'interpretation'
  | 'axes'
  | 'default'
  | 'default_slice'
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
  /** Optional parsed arithmetic expression that was present in the original signal name (e.g. '* 10') */
  expr?: string;
  /** Optional scalar transform expression parsed from signal attribute (e.g. "*10+1" or "(v*10+1)/100") */
  transform?: {
    expression?: string; // original expression (with 'v' as placeholder for dataset values)
  };
}

type WithError<T extends DatasetDef> = T & {
  errorDataset?: Dataset<ArrayShape, NumericType>;
};

export type AxisDef = DatasetDef<NumericType>;

export type DefaultSlice = (number | '.')[];
export interface SilxStyle {
  signalScaleType?: ColorScaleType;
  axisScaleTypes?: AxisMapping<AxisScaleType>;
}

export interface NxData<
  T extends NumericLikeType | ComplexType = NumericLikeType | ComplexType,
> {
  titleDataset?: Dataset<ScalarShape, StringType>;
  signalDef: WithError<DatasetDef<T>>;
  auxDefs: WithError<DatasetDef>[];
  axisDefs: AxisMapping<AxisDef>;
  defaultSlice?: DefaultSlice;
  silxStyle: SilxStyle;
}

export interface NxValues<T extends NumericLikeType | ComplexType> {
  title: string;
  signal: ArrayValue<T>;
  errors?: ArrayValue<NumericType>;
  auxValues: ArrayValue<NumericLikeType | ComplexType>[];
  auxErrors: (ArrayValue<NumericType> | undefined)[];
  axisValues: AxisMapping<ArrayValue<NumericType>>;
}
