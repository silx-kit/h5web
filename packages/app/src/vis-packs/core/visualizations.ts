import type { Dataset } from '@h5web/shared';
import {
  hasArrayShape,
  hasComplexType,
  hasCompoundType,
  hasMinDims,
  hasNonNullShape,
  hasNumericType,
  hasPrintableCompoundType,
  hasPrintableType,
  hasScalarShape,
} from '@h5web/shared';
import {
  FiActivity,
  FiCode,
  FiCpu,
  FiGrid,
  FiImage,
  FiMap,
  FiPackage,
} from 'react-icons/fi';

import type { AttrValuesStore } from '../../providers/models';
import type { VisDef } from '../models';
import CompoundMatrixVisContainer from './compound/CompoundMatrixVisContainer';
import {
  ComplexConfigProvider,
  ComplexLineConfigProvider,
  HeatmapConfigProvider,
  LineConfigProvider,
  MatrixConfigProvider,
  RgbConfigProvider,
} from './configs';
import {
  ComplexLineVisContainer,
  ComplexVisContainer,
  HeatmapVisContainer,
  LineVisContainer,
  MatrixVisContainer,
  RawVisContainer,
  RgbVisContainer,
  ScalarVisContainer,
} from './containers';
import { SurfaceConfigProvider } from './surface/config';
import SurfaceVisContainer from './surface/SurfaceVisContainer';

export enum Vis {
  Raw = 'Raw',
  Scalar = 'Scalar',
  Matrix = 'Matrix',
  Line = 'Line',
  Heatmap = 'Heatmap',
  Complex = 'Complex',
  ComplexLine = 'ComplexLine',
  RGB = 'RGB',
  CompoundMatrix = 'CompoundMatrix',
  Surface = 'Surface',
}

export interface CoreVisDef extends VisDef {
  supportsDataset: (
    dataset: Dataset,
    attrValuesStore: AttrValuesStore,
  ) => boolean;
}

export const CORE_VIS: Record<Vis, CoreVisDef> = {
  [Vis.Raw]: {
    name: Vis.Raw,
    Icon: FiCpu,
    Container: RawVisContainer,
    supportsDataset: hasNonNullShape,
  },

  [Vis.Scalar]: {
    name: Vis.Scalar,
    Icon: FiCode,
    Container: ScalarVisContainer,
    supportsDataset: (dataset) => {
      return hasPrintableType(dataset) && hasScalarShape(dataset);
    },
  },

  [Vis.Matrix]: {
    name: Vis.Matrix,
    Icon: FiGrid,
    Container: MatrixVisContainer,
    ConfigProvider: MatrixConfigProvider,
    supportsDataset: (dataset) => {
      return hasPrintableType(dataset) && hasArrayShape(dataset);
    },
  },

  [Vis.Line]: {
    name: Vis.Line,
    Icon: FiActivity,
    Container: LineVisContainer,
    ConfigProvider: LineConfigProvider,
    supportsDataset: (dataset) => {
      return hasNumericType(dataset) && hasArrayShape(dataset);
    },
  },

  [Vis.Heatmap]: {
    name: Vis.Heatmap,
    Icon: FiMap,
    Container: HeatmapVisContainer,
    ConfigProvider: HeatmapConfigProvider,
    supportsDataset: (dataset) => {
      return (
        hasNumericType(dataset) &&
        hasArrayShape(dataset) &&
        hasMinDims(dataset, 2)
      );
    },
  },

  [Vis.ComplexLine]: {
    name: Vis.Line,
    Icon: FiActivity,
    Container: ComplexLineVisContainer,
    ConfigProvider: ComplexLineConfigProvider,
    supportsDataset: (dataset) => {
      return hasComplexType(dataset) && hasArrayShape(dataset);
    },
  },

  [Vis.Complex]: {
    name: Vis.Heatmap,
    Icon: FiMap,
    Container: ComplexVisContainer,
    ConfigProvider: ComplexConfigProvider,
    supportsDataset: (dataset) => {
      return (
        hasComplexType(dataset) &&
        hasArrayShape(dataset) &&
        hasMinDims(dataset, 2)
      );
    },
  },

  [Vis.RGB]: {
    name: Vis.RGB,
    Icon: FiImage,
    Container: RgbVisContainer,
    ConfigProvider: RgbConfigProvider,
    supportsDataset: (dataset, attrValuesStore) => {
      return (
        attrValuesStore.getSingle(dataset, 'CLASS') === 'IMAGE' &&
        hasArrayShape(dataset) &&
        dataset.shape.length >= 3 && // 2 for axes + 1 for RGB channels
        dataset.shape[dataset.shape.length - 1] === 3 && // 3 channels on last dim
        hasNumericType(dataset)
      );
    },
  },

  [Vis.CompoundMatrix]: {
    name: Vis.Matrix,
    Icon: FiGrid,
    Container: CompoundMatrixVisContainer,
    ConfigProvider: MatrixConfigProvider,
    supportsDataset: (dataset) => {
      return (
        hasCompoundType(dataset) &&
        hasPrintableCompoundType(dataset) &&
        hasArrayShape(dataset) &&
        hasMinDims(dataset, 1)
      );
    },
  },

  [Vis.Surface]: {
    name: Vis.Surface,
    Icon: FiPackage,
    Container: SurfaceVisContainer,
    ConfigProvider: SurfaceConfigProvider,
    supportsDataset: (dataset) => {
      // @ts-expect-error
      const enableSurfaceVis = window.H5WEB_EXPERIMENTAL;

      return (
        enableSurfaceVis &&
        hasNumericType(dataset) &&
        hasArrayShape(dataset) &&
        hasMinDims(dataset, 2)
      );
    },
  },
};
