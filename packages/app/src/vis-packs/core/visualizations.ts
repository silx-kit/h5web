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
import { MdDataArray } from 'react-icons/md';

import { type AttrValuesStore } from '../../providers/models';
import { findScalarStrAttr, getAttributeValue } from '../../utils';
import { type VisDef } from '../models';
import {
  HeatmapConfigProvider,
  LineConfigProvider,
  MatrixConfigProvider,
  RawConfigProvider,
  RgbConfigProvider,
} from './configs';
import {
  ArrayVisContainer,
  ComplexHeatmapVisContainer,
  ComplexLineVisContainer,
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
  Array = 'Array',
  Matrix = 'Matrix',
  Line = 'Line',
  Heatmap = 'Heatmap',
  ComplexHeatmap = 'ComplexHeatmap',
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
    supportsDataset: hasScalarShape,
  },

  [Vis.Scalar]: {
    name: Vis.Scalar,
    Icon: FiCode,
    Container: ScalarVisContainer,
    supportsDataset: (dataset) => {
      return hasScalarShape(dataset) && hasPrintableType(dataset);
    },
  },

  [Vis.Array]: {
    name: Vis.Array,
    Icon: MdDataArray,
    Container: ArrayVisContainer,
    ConfigProvider: RawConfigProvider,
    supportsDataset: hasArrayShape,
  },

  [Vis.Matrix]: {
    name: Vis.Matrix,
    Icon: FiGrid,
    Container: MatrixVisContainer,
    ConfigProvider: MatrixConfigProvider,
    supportsDataset: (dataset) => {
      return hasArrayShape(dataset) && hasPrintableType(dataset);
    },
  },

  [Vis.Line]: {
    name: Vis.Line,
    Icon: FiActivity,
    Container: LineVisContainer,
    ConfigProvider: LineConfigProvider,
    supportsDataset: (dataset) => {
      return hasArrayShape(dataset) && hasNumericLikeType(dataset);
    },
  },

  [Vis.ComplexLine]: {
    name: Vis.Line,
    Icon: FiActivity,
    Container: ComplexLineVisContainer,
    ConfigProvider: LineConfigProvider,
    supportsDataset: (dataset) => {
      return hasArrayShape(dataset) && hasComplexType(dataset);
    },
  },

  [Vis.Heatmap]: {
    name: Vis.Heatmap,
    Icon: FiMap,
    Container: HeatmapVisContainer,
    ConfigProvider: HeatmapConfigProvider,
    supportsDataset: (dataset) => {
      return (
        hasArrayShape(dataset) &&
        hasMinDims(dataset, 2) &&
        hasNumericLikeType(dataset)
      );
    },
  },

  [Vis.ComplexHeatmap]: {
    name: Vis.Heatmap,
    Icon: FiMap,
    Container: ComplexHeatmapVisContainer,
    ConfigProvider: HeatmapConfigProvider,
    supportsDataset: (dataset) => {
      return (
        hasArrayShape(dataset) &&
        hasMinDims(dataset, 2) &&
        hasComplexType(dataset)
      );
    },
  },

  [Vis.RGB]: {
    name: Vis.RGB,
    Icon: FiImage,
    Container: RgbVisContainer,
    ConfigProvider: RgbConfigProvider,
    supportsDataset: (dataset, attrValuesStore) => {
      if (
        !hasArrayShape(dataset) ||
        !hasMinDims(dataset, 3) || // 2 for axes + 1 for RGB(A) channels
        !hasNumericType(dataset)
      ) {
        return false;
      }

      // Check number of channels: 3 for RGB/BGR, 4 for RGBA/BGRA
      const lastDim = dataset.shape.dims[dataset.shape.dims.length - 1];
      if (lastDim < 3 || lastDim > 4) {
        return false;
      }

      // Check for `CLASS=IMAGE` attribute
      const classAttr = findScalarStrAttr(dataset, 'CLASS');
      return getAttributeValue(dataset, classAttr, attrValuesStore) === 'IMAGE';
    },
  },

  [Vis.Compound]: {
    name: Vis.Compound,
    Icon: FiGrid,
    Container: CompoundVisContainer,
    ConfigProvider: MatrixConfigProvider,
    supportsDataset: (dataset) => {
      return (
        hasNonNullShape(dataset) &&
        hasCompoundType(dataset) &&
        hasPrintableCompoundType(dataset)
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
        hasArrayShape(dataset) &&
        hasMinDims(dataset, 2) &&
        hasNumericType(dataset)
      );
    },
  },
} satisfies Record<Vis, CoreVisDef>;
