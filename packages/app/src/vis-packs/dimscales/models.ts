import {
  type ArrayShape,
  type Dataset,
  type NumericType,
} from '@h5web/shared/hdf5-models';

export interface DimScaleDef {
  label?: string;
  dataset?: Dataset<ArrayShape, NumericType>; // undefined when the dimension is labelled but has no usable scale
}
