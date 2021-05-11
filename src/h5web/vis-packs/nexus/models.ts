import type {
  ArrayShape,
  ComplexType,
  Dataset,
  H5WebComplex,
  NumArrayDataset,
  NumericType,
  ScalarShape,
  StringType,
} from '../../providers/models';
import type { AxisMapping, ScaleType } from '../core/models';

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
}

export interface NxData {
  signalDataset: Dataset<ArrayShape, NumericType | ComplexType>;
  errorsDataset?: NumArrayDataset;
  axisDatasets: AxisDatasetMapping;
  auxDatasets: NumArrayDataset[];
  titleDataset?: Dataset<ScalarShape, StringType>;
  silxStyle: SilxStyle;
}

export interface NxValues {
  signal: (number | H5WebComplex)[];
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
