import { FiActivity, FiImage, FiMap } from 'react-icons/fi';
import type { VisDef } from '../models';
import {
  NxSpectrumContainer,
  NxImageContainer,
  NxComplexImageContainer,
  NxComplexSpectrumContainer,
  NxRgbContainer,
} from './containers';
import {
  LineToolbar,
  HeatmapToolbar,
  ComplexToolbar,
  ComplexLineToolbar,
  RgbToolbar,
} from '../../toolbar/toolbars';
import {
  LineConfigProvider,
  HeatmapConfigProvider,
  ComplexConfigProvider,
  ComplexLineConfigProvider,
  RgbConfigProvider,
} from '../core/configs';

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
    Toolbar: LineToolbar,
    Container: NxSpectrumContainer,
    ConfigProvider: LineConfigProvider,
  },

  [NexusVis.NxComplexSpectrum]: {
    name: NexusVis.NxSpectrum,
    Icon: FiActivity,
    Toolbar: ComplexLineToolbar,
    Container: NxComplexSpectrumContainer,
    ConfigProvider: ComplexLineConfigProvider,
  },

  [NexusVis.NxImage]: {
    name: NexusVis.NxImage,
    Icon: FiMap,
    Toolbar: HeatmapToolbar,
    Container: NxImageContainer,
    ConfigProvider: HeatmapConfigProvider,
  },

  [NexusVis.NxComplexImage]: {
    name: NexusVis.NxImage,
    Icon: FiMap,
    Toolbar: ComplexToolbar,
    Container: NxComplexImageContainer,
    ConfigProvider: ComplexConfigProvider,
  },

  [NexusVis.NxRGB]: {
    name: NexusVis.NxRGB,
    Icon: FiImage,
    Toolbar: RgbToolbar,
    Container: NxRgbContainer,
    ConfigProvider: RgbConfigProvider,
  },
};
