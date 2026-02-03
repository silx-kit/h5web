import {
  hasComplexType,
  hasMinDims,
  hasNumDims,
  hasNumericType,
} from '@h5web/shared/guards';
import {
  type ArrayShape,
  type ComplexType,
  type Dataset,
  type GroupWithChildren,
  type NumericLikeType,
} from '@h5web/shared/hdf5-models';
import { NxInterpretation } from '@h5web/shared/nexus-models';
import { FiActivity, FiFileText, FiImage, FiMap } from 'react-icons/fi';
import { MdGrain } from 'react-icons/md';

import { type AttrValuesStore } from '../../providers/models';
import { findScalarStrAttr, getAttributeValue } from '../../utils';
import {
  HeatmapConfigProvider,
  LineConfigProvider,
  RgbConfigProvider,
} from '../core/configs';
import { ScatterConfigProvider } from '../core/scatter/config';
import { type VisDef } from '../models';
import {
  NxComplexLineContainer,
  NxHeatmapContainer,
  NxLineContainer,
  NxRgbContainer,
  NxScatterContainer,
} from './containers';
import NxNoteContainer from './containers/NxNoteContainer';
import { findAxesDatasets } from './utils';

export const NX_NOTE_VIS = {
  name: 'NX Note',
  Icon: FiFileText,
  Container: NxNoteContainer,
} satisfies VisDef;

export enum NxDataVis {
  NxLine = 'NX Line',
  NxComplexLine = 'NX Complex Line',
  NxHeatmap = 'NX Heatmap',
  NxRGB = 'NX RGB',
  NxScatter = 'NX Scatter',
}

export interface NxDataVisDef extends VisDef {
  supports: (
    group: GroupWithChildren,
    signal: Dataset<ArrayShape, NumericLikeType | ComplexType>,
    interpretation: string | undefined,
    attrValuesStore: AttrValuesStore,
  ) => boolean;
  isPrimary: (interpretation: string | undefined) => boolean;
}

export const NX_DATA_VIS = {
  [NxDataVis.NxLine]: {
    name: NxDataVis.NxLine,
    Icon: FiActivity,
    Container: NxLineContainer,
    ConfigProvider: LineConfigProvider,
    supports: (_, signal) => !hasComplexType(signal),
    isPrimary: (interpretation) => interpretation === NxInterpretation.Spectrum,
  },

  [NxDataVis.NxComplexLine]: {
    name: NxDataVis.NxLine,
    Icon: FiActivity,
    Container: NxComplexLineContainer,
    ConfigProvider: LineConfigProvider,
    supports: (_, signal) => hasComplexType(signal),
    isPrimary: (interpretation) => interpretation === NxInterpretation.Spectrum,
  },

  [NxDataVis.NxHeatmap]: {
    name: NxDataVis.NxHeatmap,
    Icon: FiMap,
    Container: NxHeatmapContainer,
    ConfigProvider: HeatmapConfigProvider,
    supports: (_, signal) => hasMinDims(signal, 2),
    isPrimary: (interpretation) => interpretation === NxInterpretation.Image,
  },

  [NxDataVis.NxRGB]: {
    name: NxDataVis.NxRGB,
    Icon: FiImage,
    Container: NxRgbContainer,
    ConfigProvider: RgbConfigProvider,
    supports: (_, signal, interpretation, attrValuesStore) => {
      const classAttr = findScalarStrAttr(signal, 'CLASS');
      const classVal = getAttributeValue(signal, classAttr, attrValuesStore);

      return (
        (interpretation === NxInterpretation.RGB || classVal === 'IMAGE') &&
        hasMinDims(signal, 3) && // 2 for axes + 1 for RGB channels
        signal.shape.dims[signal.shape.dims.length - 1] === 3 && // 3 channels
        hasNumericType(signal)
      );
    },
    isPrimary: () => true, // always primary if supported
  },

  [NxDataVis.NxScatter]: {
    name: NxDataVis.NxScatter,
    Icon: MdGrain,
    Container: NxScatterContainer,
    ConfigProvider: ScatterConfigProvider,
    supports: (group, signal, _, attrValuesStore) => {
      if (!hasNumDims(signal, 1)) {
        return false;
      }

      const axisDatasets = findAxesDatasets(group, signal, attrValuesStore);
      return (
        axisDatasets.length === 2 &&
        axisDatasets.every((d) => d && hasNumDims(d, 1))
      );
    },
    isPrimary: () => true, // always primary if supported
  },
} satisfies Record<NxDataVis, NxDataVisDef>;
