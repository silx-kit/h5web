import { FiActivity, FiFileText, FiImage, FiMap } from 'react-icons/fi';
import { MdGrain } from 'react-icons/md';

import {
  ComplexLineConfigProvider,
  HeatmapConfigProvider,
  LineConfigProvider,
  RgbConfigProvider,
} from '../core/configs';
import { ScatterConfigProvider } from '../core/scatter/config';
import { type VisDef } from '../models';
import {
  NxComplexSpectrumContainer,
  NxImageContainer,
  NxRgbContainer,
  NxScatterContainer,
  NxSpectrumContainer,
} from './containers';
import NxNoteContainer from './containers/NxNoteContainer';

export enum NexusVis {
  NxSpectrum = 'NX Line',
  NxComplexSpectrum = 'NX Complex Line',
  NxImage = 'NX Heatmap',
  NxRGB = 'NX RGB',
  NxScatter = 'NX Scatter',
  NxNote = 'NX Note',
}

export const NEXUS_VIS = {
  [NexusVis.NxSpectrum]: {
    name: NexusVis.NxSpectrum,
    Icon: FiActivity,
    Container: NxSpectrumContainer,
    ConfigProvider: LineConfigProvider,
  },

  [NexusVis.NxComplexSpectrum]: {
    name: NexusVis.NxSpectrum,
    Icon: FiActivity,
    Container: NxComplexSpectrumContainer,
    ConfigProvider: ComplexLineConfigProvider,
  },

  [NexusVis.NxImage]: {
    name: NexusVis.NxImage,
    Icon: FiMap,
    Container: NxImageContainer,
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
