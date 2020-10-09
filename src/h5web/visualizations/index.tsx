import type { ElementType } from 'react';
import { FiCode, FiGrid, FiActivity, FiMap, FiCpu } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { range } from 'lodash-es';
import RawVis from './RawVis';
import ScalarVis from './ScalarVis';
import { Vis, DimensionMapping } from '../dataset-visualizer/models';
import LineToolbar from '../toolbar/LineToolbar';
import HeatmapToolbar from '../toolbar/HeatmapToolbar';
import type {
  HDF5Dataset,
  HDF5Value,
  HDF5SimpleShape,
} from '../providers/models';
import {
  isScalarShape,
  isBaseType,
  isSimpleShape,
  isNumericType,
} from '../providers/utils';
import MappedMatrixVis from './matrix/MappedMatrixVis';
import MappedLineVis from './line/MappedLineVis';
import MappedHeatmapVis from './heatmap/MappedHeatmapVis';

interface VisDef {
  Icon: IconType;
  Toolbar?: ElementType<{}>;
  Component: ElementType<{
    value: HDF5Value;
    rawDims: number[];
    mapperState: DimensionMapping;
  }>;
  supportsDataset(dataset: HDF5Dataset): boolean;
  defaultMappingState(dataset: HDF5Dataset): DimensionMapping;
}

export const VIS_DEFS: Record<Vis, VisDef> = {
  [Vis.Raw]: {
    Icon: FiCpu,
    Component: RawVis,
    supportsDataset: () => true,
    defaultMappingState: () => undefined,
  },

  [Vis.Scalar]: {
    Icon: FiCode,
    Component: ScalarVis,
    supportsDataset: (dataset) => {
      const { type, shape } = dataset;
      return isBaseType(type) && isScalarShape(shape);
    },
    defaultMappingState: () => undefined,
  },

  [Vis.Matrix]: {
    Icon: FiGrid,
    Component: MappedMatrixVis,
    supportsDataset: (dataset) => {
      const { type, shape } = dataset;
      return isBaseType(type) && isSimpleShape(shape) && shape.dims.length >= 1;
    },
    defaultMappingState: (dataset) => {
      const { dims } = dataset.shape as HDF5SimpleShape;
      return dims.length === 1
        ? ['x']
        : [...range(dims.length - 2).fill(0), 'y', 'x'];
    },
  },

  [Vis.Line]: {
    Icon: FiActivity,
    Toolbar: LineToolbar,
    Component: MappedLineVis,
    supportsDataset: (dataset) => {
      const { type, shape } = dataset;
      return (
        isNumericType(type) && isSimpleShape(shape) && shape.dims.length >= 1
      );
    },
    defaultMappingState: (dataset) => {
      const { dims } = dataset.shape as HDF5SimpleShape;
      return [...range(dims.length - 1).fill(0), 'x'];
    },
  },

  [Vis.Heatmap]: {
    Icon: FiMap,
    Toolbar: HeatmapToolbar,
    Component: MappedHeatmapVis,
    supportsDataset: (dataset) => {
      const { type, shape } = dataset;
      return (
        isNumericType(type) && isSimpleShape(shape) && shape.dims.length >= 2
      );
    },
    defaultMappingState: (dataset) => {
      const { dims } = dataset.shape as HDF5SimpleShape;
      return [...range(dims.length - 2).fill(0), 'y', 'x'];
    },
  },
};
