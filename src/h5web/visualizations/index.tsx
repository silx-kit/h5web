import React, { ElementType, ReactElement } from 'react';
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
import { assertNumOrStr, assertArray } from './shared/utils';
import MappedVis from './shared/MappedVis';

interface VisDef {
  Icon: IconType;
  Toolbar?: ElementType<{}>;
  supportsDataset(dataset: HDF5Dataset): boolean;
  defaultMappingState(dataset: HDF5Dataset): DimensionMapping;
  render(
    value: HDF5Value,
    dataset: HDF5Dataset,
    mapperState: DimensionMapping
  ): ReactElement;
}

export const VIS_DEFS: Record<Vis, VisDef> = {
  [Vis.Raw]: {
    Icon: FiCpu,
    supportsDataset: () => true,
    defaultMappingState: () => undefined,
    render: (value) => <RawVis value={value} />,
  },

  [Vis.Scalar]: {
    Icon: FiCode,
    supportsDataset: (dataset) => {
      const { type, shape } = dataset;
      return isBaseType(type) && isScalarShape(shape);
    },
    defaultMappingState: () => undefined,
    render: (value) => {
      assertNumOrStr(value);
      return <ScalarVis value={value} />;
    },
  },

  [Vis.Matrix]: {
    Icon: FiGrid,
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
    render: (value, dataset, mapperState) => {
      assertArray<number | string>(value);
      return (
        <MappedVis
          component={MatrixVis}
          dataset={dataset}
          value={value}
          mapperState={mapperState}
        />
      );
    },
  },

  [Vis.Line]: {
    Icon: FiActivity,
    Toolbar: LineToolbar,
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
    render: (value, dataset, mapperState) => {
      assertArray<number>(value);
      return (
        <MappedVis
          component={LineVis}
          dataset={dataset}
          value={value}
          mapperState={mapperState}
        />
      );
    },
  },

  [Vis.Heatmap]: {
    Icon: FiMap,
    Toolbar: HeatmapToolbar,
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
    render: (value, dataset, mapperState) => {
      assertArray<number>(value);
      return (
        <MappedVis
          component={HeatmapVis}
          dataset={dataset}
          value={value}
          mapperState={mapperState}
        />
      );
    },
  },
};
