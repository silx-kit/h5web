import type { HDF5StringType } from '../../providers/hdf5-models';
import type {
  Dataset,
  NumArrayDataset,
  ScalarShape,
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
  signalDataset: NumArrayDataset;
  errorsDataset?: NumArrayDataset;
  titleDataset?: Dataset<ScalarShape, HDF5StringType>;
  axisDatasetMapping: AxisDatasetMapping;
  silxStyle: SilxStyle;
  auxDatasets: NumArrayDataset[];
}

export type AxisDatasetMapping = (NumArrayDataset | undefined)[];

export interface SilxStyle {
  signalScaleType?: ScaleType;
  axesScaleType?: ScaleType[];
}
