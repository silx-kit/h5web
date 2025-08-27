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

export enum NexusVis {
  NxLine = 'NX Line',
  NxComplexLine = 'NX Complex Line',
  NxHeatmap = 'NX Heatmap',
  NxRGB = 'NX RGB',
  NxScatter = 'NX Scatter',
  NxNote = 'NX Note',
}

export const NEXUS_VIS = {
  [NexusVis.NxLine]: {
    name: NexusVis.NxLine,
    Icon: FiActivity,
    Container: NxLineContainer,
    ConfigProvider: LineConfigProvider,
  },

  [NexusVis.NxComplexLine]: {
    name: NexusVis.NxLine,
    Icon: FiActivity,
    Container: NxComplexLineContainer,
    ConfigProvider: LineConfigProvider,
  },

  [NexusVis.NxHeatmap]: {
    name: NexusVis.NxHeatmap,
    Icon: FiMap,
    Container: NxHeatmapContainer,
    ConfigProvider: HeatmapConfigProvider,
  },

  [NexusVis.NxRGB]: {
    name: NexusVis.NxRGB,
    Icon: FiImage,
    Container: NxRgbContainer,
    ConfigProvider: RgbConfigProvider,
  },

  [NexusVis.NxScatter]: {
    name: NexusVis.NxScatter,
    Icon: MdGrain,
    Container: NxScatterContainer,
    ConfigProvider: ScatterConfigProvider,
  },

  [NexusVis.NxNote]: {
    name: NexusVis.NxNote,
    Icon: FiFileText,
    Container: NxNoteContainer,
  },
} satisfies Record<NexusVis, VisDef>;
