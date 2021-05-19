import { FiActivity, FiMap } from 'react-icons/fi';
import HeatmapToolbar from '../../toolbar/HeatmapToolbar';
import LineToolbar from '../../toolbar/LineToolbar';
import {
  NxSpectrumContainer,
  NxImageContainer,
  NxComplexImageContainer,
  NxComplexSpectrumContainer,
} from './containers';
import type { VisDef } from '../models';
import { LineConfigProvider } from '../core/line/config';
import { HeatmapConfigProvider } from '../core/heatmap/config';
import ComplexToolbar from '../../toolbar/ComplexToolbar';
import { ComplexConfigProvider } from '../core/complex/config';
import ComplexLineToolbar from '../../toolbar/ComplexLineToolbar';
import { ComplexLineConfigProvider } from '../core/complex/lineConfig';

export enum NexusVis {
  NxSpectrum = 'NX Spectrum',
  NxImage = 'NX Image',
  NxComplexImage = 'NX Complex Image',
  NxComplexSpectrum = 'NX Complex Spectrum',
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
};
