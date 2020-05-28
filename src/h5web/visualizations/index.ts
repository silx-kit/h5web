import { ElementType } from 'react';
import { FiCode, FiGrid, FiActivity, FiMap, FiCpu } from 'react-icons/fi';
import { IconType } from 'react-icons';
import RawVis from './RawVis';
import MatrixVis from './matrix/MatrixVis';
import ScalarVis from './ScalarVis';
import LineVis from './line/LineVis';
import HeatmapVis from './heatmap/HeatmapVis';
import { Vis } from '../dataset-visualizer/models';
import LineToolbar from './line/LineToolbar';
import HeatmapToolbar from './heatmap/HeatmapToolbar';
import { HDF5Dataset } from '../providers/models';
import {
  isScalarShape,
  isBaseType,
  isSimpleShape,
  hasSimpleDims,
  isNumericType,
} from '../providers/utils';

interface VisDef {
  Component: ElementType;
  Icon: IconType;
  Toolbar?: ElementType;
  supportsDataset(dataset: HDF5Dataset): boolean;
}

export const VIS_DEFS: Record<Vis, VisDef> = {
  [Vis.Raw]: {
    Component: RawVis,
    Icon: FiCpu,
    supportsDataset: () => true,
  },
  [Vis.Scalar]: {
    Component: ScalarVis,
    Icon: FiCode,
    supportsDataset: dataset => {
      const { type, shape } = dataset;
      return isBaseType(type) && isScalarShape(shape);
    },
  },
  [Vis.Matrix]: {
    Component: MatrixVis,
    Icon: FiGrid,
    supportsDataset: dataset => {
      const { type, shape } = dataset;
      return isBaseType(type) && isSimpleShape(shape) && hasSimpleDims(shape);
    },
  },
  [Vis.Line]: {
    Component: LineVis,
    Icon: FiActivity,
    Toolbar: LineToolbar,
    supportsDataset: dataset => {
      const { type, shape } = dataset;
      return (
        isNumericType(type) && isSimpleShape(shape) && hasSimpleDims(shape)
      );
    },
  },
  [Vis.Heatmap]: {
    Component: HeatmapVis,
    Icon: FiMap,
    Toolbar: HeatmapToolbar,
    supportsDataset: dataset => {
      const { type, shape } = dataset;
      return (
        isNumericType(type) && isSimpleShape(shape) && shape.dims.length === 2
      );
    },
  },
};
