import { FiActivity, FiFileText, FiImage, FiMap } from 'react-icons/fi';
import { MdGrain } from 'react-icons/md';

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

export const NX_DATA_VIS = {
  [NxDataVis.NxLine]: {
    name: NxDataVis.NxLine,
    Icon: FiActivity,
    Container: NxLineContainer,
    ConfigProvider: LineConfigProvider,
  },

  [NxDataVis.NxComplexLine]: {
    name: NxDataVis.NxLine,
    Icon: FiActivity,
    Container: NxComplexLineContainer,
    ConfigProvider: LineConfigProvider,
  },

  [NxDataVis.NxHeatmap]: {
    name: NxDataVis.NxHeatmap,
    Icon: FiMap,
    Container: NxHeatmapContainer,
    ConfigProvider: HeatmapConfigProvider,
  },

  [NxDataVis.NxRGB]: {
    name: NxDataVis.NxRGB,
    Icon: FiImage,
    Container: NxRgbContainer,
    ConfigProvider: RgbConfigProvider,
  },

  [NxDataVis.NxScatter]: {
    name: NxDataVis.NxScatter,
    Icon: MdGrain,
    Container: NxScatterContainer,
    ConfigProvider: ScatterConfigProvider,
  },
} satisfies Record<NxDataVis, VisDef>;
