import {
  hasArrayShape,
  hasComplexType,
  hasCompoundType,
  hasMinDims,
  hasNonNullShape,
  hasNumericLikeType,
  hasNumericType,
  hasPrintableCompoundType,
  hasPrintableType,
  hasScalarShape,
} from '@h5web/shared/guards';
import { type Dataset } from '@h5web/shared/hdf5-models';
import {
  FiActivity,
  FiCode,
  FiCpu,
  FiGrid,
  FiImage,
  FiMap,
  FiPackage,
} from 'react-icons/fi';

import { type AttrValuesStore } from '../../providers/models';
import { type VisDef } from '../models';
import {
  ComplexConfigProvider,
  ComplexLineConfigProvider,
  HeatmapConfigProvider,
  LineConfigProvider,
  MatrixConfigProvider,
  RawConfigProvider,
  RgbConfigProvider,
} from './configs';
import {
  ComplexLineVisContainer,
  ComplexVisContainer,
  CompoundVisContainer,
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
  Compound = 'Compound',
  Surface = 'Surface',
}

export interface CoreVisDef extends VisDef {
  supportsDataset: (
    dataset: Dataset,
    attrValuesStore: AttrValuesStore,
  ) => boolean;
}

export const CORE_VIS = {
  [Vis.Raw]: {
    name: Vis.Raw,
    Icon: FiCpu,
    Container: RawVisContainer,
    ConfigProvider: RawConfigProvider,
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
      return hasNumericLikeType(dataset) && hasArrayShape(dataset);
    },
  },

  [Vis.Heatmap]: {
    name: Vis.Heatmap,
    Icon: FiMap,
    Container: HeatmapVisContainer,
    ConfigProvider: HeatmapConfigProvider,
    supportsDataset: (dataset) => {
      return (
        hasNumericLikeType(dataset) &&
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

  [Vis.Compound]: {
    name: Vis.Compound,
    Icon: FiGrid,
    Container: CompoundVisContainer,
    ConfigProvider: MatrixConfigProvider,
    supportsDataset: (dataset) => {
      return (
        hasCompoundType(dataset) &&
        hasPrintableCompoundType(dataset) &&
        hasNonNullShape(dataset) &&
        (hasScalarShape(dataset) || hasMinDims(dataset, 1))
      );
    },
  },

  [Vis.Surface]: {
    name: Vis.Surface,
    Icon: FiPackage,
    Container: SurfaceVisContainer,
    ConfigProvider: SurfaceConfigProvider,
    supportsDataset: (dataset) => {
      // @ts-expect-error - Untyped global flag
      const enableSurfaceVis = globalThis.H5WEB_EXPERIMENTAL as boolean;

      return (
        enableSurfaceVis &&
        hasNumericType(dataset) &&
        hasArrayShape(dataset) &&
        hasMinDims(dataset, 2)
      );
    },
  },
} satisfies Record<Vis, CoreVisDef>;
