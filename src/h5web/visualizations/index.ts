import type { ElementType } from 'react';
import { FiCode, FiGrid, FiActivity, FiMap, FiCpu } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { range } from 'lodash-es';
import RawVis from './RawVis';
import MatrixVis from './matrix/MatrixVis';
import ScalarVis from './ScalarVis';
import LineVis from './line/LineVis';
import HeatmapVis from './heatmap/HeatmapVis';
import { Vis, DimensionMapping } from '../dataset-visualizer/models';
import LineToolbar from './line/LineToolbar';
import HeatmapToolbar from './heatmap/HeatmapToolbar';
import type { HDF5Dataset } from '../providers/models';
import {
  isScalarShape,
  isBaseType,
  isSimpleShape,
  isNumericType,
} from '../providers/utils';

interface VisDef {
  Component: ElementType;
  Icon: IconType;
  Toolbar?: ElementType;
  supportsDataset(dataset: HDF5Dataset): boolean;
  defaultMappingState(datasetDims: number[]): DimensionMapping | undefined;
}

export const VIS_DEFS: Record<Vis, VisDef> = {
  [Vis.Raw]: {
    Component: RawVis,
    Icon: FiCpu,
    supportsDataset: () => true,
    defaultMappingState: () => undefined,
  },
  [Vis.Scalar]: {
    Component: ScalarVis,
    Icon: FiCode,
    supportsDataset: (dataset) => {
      const { type, shape } = dataset;
      return isBaseType(type) && isScalarShape(shape);
    },
    defaultMappingState: () => undefined,
  },
  [Vis.Matrix]: {
    Component: MatrixVis,
    Icon: FiGrid,
    supportsDataset: (dataset) => {
      const { type, shape } = dataset;
      return isBaseType(type) && isSimpleShape(shape) && shape.dims.length >= 1;
    },
    defaultMappingState: (datasetDims: number[]) =>
      datasetDims.length > 2
        ? [...range(datasetDims.length - 2).fill(0), 'y', 'x']
        : undefined,
  },
  [Vis.Line]: {
    Component: LineVis,
    Icon: FiActivity,
    Toolbar: LineToolbar,
    supportsDataset: (dataset) => {
      const { type, shape } = dataset;
      return (
        isNumericType(type) && isSimpleShape(shape) && shape.dims.length >= 1
      );
    },
    defaultMappingState: (datasetDims: number[]) => [
      ...range(datasetDims.length - 1).fill(0),
      'x',
    ],
  },
  [Vis.Heatmap]: {
    Component: HeatmapVis,
    Icon: FiMap,
    Toolbar: HeatmapToolbar,
    supportsDataset: (dataset) => {
      const { type, shape } = dataset;
      return (
        isNumericType(type) && isSimpleShape(shape) && shape.dims.length >= 2
      );
    },
    defaultMappingState: (datasetDims: number[]) => [
      ...range(datasetDims.length - 2).fill(0),
      'y',
      'x',
    ],
  },
};
