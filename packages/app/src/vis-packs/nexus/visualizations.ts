import { FiActivity, FiImage, FiMap } from 'react-icons/fi';
import { MdGrain } from 'react-icons/md';

import {
  ComplexConfigProvider,
  ComplexLineConfigProvider,
  HeatmapConfigProvider,
  LineConfigProvider,
  RgbConfigProvider,
} from '../core/configs';
import { ScatterConfigProvider } from '../core/scatter/config';
import { type VisDef } from '../models';
import {
  NxComplexImageContainer,
  NxComplexSpectrumContainer,
  NxImageContainer,
  NxRgbContainer,
  NxScatterContainer,
  NxSpectrumContainer,
} from './containers';

export enum NexusVis {
  NxSpectrum = 'NX Line',
  NxComplexSpectrum = 'NX Complex Line',
  NxImage = 'NX Heatmap',
  NxComplexImage = 'NX Complex Heatmap',
  NxRGB = 'NX RGB',
  NxScatter = 'NX Scatter',
}

export const NEXUS_VIS: Record<NexusVis, VisDef> = {
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

  [NexusVis.NxComplexImage]: {
    name: NexusVis.NxImage,
    Icon: FiMap,
    Container: NxComplexImageContainer,
    ConfigProvider: ComplexConfigProvider,
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
};
