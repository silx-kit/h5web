import { FiActivity, FiImage, FiMap } from 'react-icons/fi';

import {
  LineConfigProvider,
  HeatmapConfigProvider,
  ComplexConfigProvider,
  ComplexLineConfigProvider,
  RgbConfigProvider,
} from '../core/configs';
import type { VisDef } from '../models';
import {
  NxSpectrumContainer,
  NxImageContainer,
  NxComplexImageContainer,
  NxComplexSpectrumContainer,
  NxRgbContainer,
} from './containers';

export enum NexusVis {
  NxSpectrum = 'NX Spectrum',
  NxComplexSpectrum = 'NX Complex Spectrum',
  NxImage = 'NX Image',
  NxComplexImage = 'NX Complex Image',
  NxRGB = 'NX RGB',
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
};
