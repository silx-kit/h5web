import type {
  HDF5NumericType,
  HDF5ScalarShape,
  HDF5SimpleShape,
  HDF5StringType,
} from '../../providers/hdf5-models';
import type { Dataset } from '../../providers/models';
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
  signalDataset: Dataset<HDF5SimpleShape, HDF5NumericType>;
  errorsDataset?: Dataset<HDF5SimpleShape, HDF5NumericType>;
  titleDataset?: Dataset<HDF5ScalarShape, HDF5StringType>;
  axisDatasetMapping: AxisDatasetMapping;
  silxStyle: SilxStyle;
  auxiliaryDatasets: Dataset<HDF5SimpleShape, HDF5NumericType>[];
}

export type AxisDatasetMapping = (
  | Dataset<HDF5SimpleShape, HDF5NumericType>
  | undefined
)[];

export interface SilxStyle {
  signalScaleType?: ScaleType;
  axesScaleType?: ScaleType[];
}
