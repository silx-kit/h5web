import { FiCode, FiGrid, FiActivity, FiMap, FiCpu } from 'react-icons/fi';
import LineToolbar from '../../toolbar/LineToolbar';
import HeatmapToolbar from '../../toolbar/HeatmapToolbar';
import type { Dataset } from '../../providers/models';
import {
  hasScalarShape,
  hasBaseType,
  hasSimpleShape,
  hasNumericType,
  hasMinDims,
} from '../../guards';
import {
  RawVisContainer,
  ScalarVisContainer,
  MatrixVisContainer,
  LineVisContainer,
  HeatmapVisContainer,
} from './containers';
import type { VisDef } from '../models';

export enum Vis {
  Raw = 'Raw',
  Scalar = 'Scalar',
  Matrix = 'Matrix',
  Line = 'Line',
  Heatmap = 'Heatmap',
}

export interface CoreVisDef extends VisDef {
  supportsDataset: (dataset: Dataset) => boolean;
}

export const CORE_VIS: Record<Vis, CoreVisDef> = {
  [Vis.Raw]: {
    name: Vis.Raw,
    Icon: FiCpu,
    Container: RawVisContainer,
    supportsDataset: () => true,
  },

  [Vis.Scalar]: {
    name: Vis.Scalar,
    Icon: FiCode,
    Container: ScalarVisContainer,
    supportsDataset: (dataset) => {
      return hasBaseType(dataset) && hasScalarShape(dataset);
    },
  },

  [Vis.Matrix]: {
    name: Vis.Matrix,
    Icon: FiGrid,
    Container: MatrixVisContainer,
    supportsDataset: (dataset) => {
      return (
        hasBaseType(dataset) &&
        hasSimpleShape(dataset) &&
        hasMinDims(dataset, 1)
      );
    },
  },

  [Vis.Line]: {
    name: Vis.Line,
    Icon: FiActivity,
    Toolbar: LineToolbar,
    Container: LineVisContainer,
    supportsDataset: (dataset) => {
      return (
        hasNumericType(dataset) &&
        hasSimpleShape(dataset) &&
        hasMinDims(dataset, 1)
      );
    },
  },

  [Vis.Heatmap]: {
    name: Vis.Heatmap,
    Icon: FiMap,
    Toolbar: HeatmapToolbar,
    Container: HeatmapVisContainer,
    supportsDataset: (dataset) => {
      return (
        hasNumericType(dataset) &&
        hasSimpleShape(dataset) &&
        hasMinDims(dataset, 2)
      );
    },
  },
};
