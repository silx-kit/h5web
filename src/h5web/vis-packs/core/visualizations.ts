import { FiCode, FiGrid, FiActivity, FiMap, FiCpu } from 'react-icons/fi';
import LineToolbar from '../../toolbar/LineToolbar';
import HeatmapToolbar from '../../toolbar/HeatmapToolbar';
import type { Dataset } from '../../providers/models';
import {
  hasScalarShape,
  hasPrintableType,
  hasArrayShape,
  hasNumericType,
  hasMinDims,
  hasNonNullShape,
  hasComplexType,
} from '../../guards';
import {
  RawVisContainer,
  ScalarVisContainer,
  MatrixVisContainer,
  LineVisContainer,
  HeatmapVisContainer,
  ComplexVisContainer,
} from './containers';
import type { VisDef } from '../models';
import { LineConfigProvider } from './line/config';
import { HeatmapConfigProvider } from './heatmap/config';
import ComplexToolbar from '../../toolbar/ComplexToolbar';
import { ComplexConfigProvider } from './complex/config';
import ComplexLineVisContainer from './containers/ComplexLineVisContainer';
import ComplexLineToolbar from '../../toolbar/ComplexLineToolbar';
import { ComplexLineConfigProvider } from './complex/lineConfig';

export enum Vis {
  Raw = 'Raw',
  Scalar = 'Scalar',
  Matrix = 'Matrix',
  Line = 'Line',
  Heatmap = 'Heatmap',
  Complex = 'Complex',
  ComplexLine = 'ComplexLine',
}

export interface CoreVisDef extends VisDef {
  supportsDataset: (dataset: Dataset) => boolean;
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
    supportsDataset: (dataset) => {
      return hasPrintableType(dataset) && hasArrayShape(dataset);
    },
  },

  [Vis.Line]: {
    name: Vis.Line,
    Icon: FiActivity,
    Toolbar: LineToolbar,
    Container: LineVisContainer,
    ConfigProvider: LineConfigProvider,
    supportsDataset: (dataset) => {
      return hasNumericType(dataset) && hasArrayShape(dataset);
    },
  },

  [Vis.Heatmap]: {
    name: Vis.Heatmap,
    Icon: FiMap,
    Toolbar: HeatmapToolbar,
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
    Toolbar: ComplexLineToolbar,
    Container: ComplexLineVisContainer,
    ConfigProvider: ComplexLineConfigProvider,
    supportsDataset: (dataset) => {
      return hasComplexType(dataset) && hasArrayShape(dataset);
    },
  },

  [Vis.Complex]: {
    name: Vis.Heatmap,
    Icon: FiMap,
    Toolbar: ComplexToolbar,
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
};
