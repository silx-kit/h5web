import type {
  ArrayShape,
  ComplexType,
  Dataset,
  NumArrayDataset,
  NumericType,
  ScalarShape,
  StringType,
} from '../../providers/models';
import type { ScaleType } from '../core/models';

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
  titleDataset?: Dataset<ScalarShape, StringType>;
  axisDatasets: AxisDatasetMapping;
  silxStyle: SilxStyle;
  auxDatasets: NumArrayDataset[];
}

export type AxisDatasetMapping = (NumArrayDataset | undefined)[];

export interface SilxStyle {
  signalScaleType?: ScaleType;
  axisScaleTypes?: ScaleType[];
}
