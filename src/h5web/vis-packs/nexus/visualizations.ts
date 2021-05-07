import { FiActivity, FiMap } from 'react-icons/fi';
import HeatmapToolbar from '../../toolbar/HeatmapToolbar';
import LineToolbar from '../../toolbar/LineToolbar';
import {
  NxSpectrumContainer,
  NxImageContainer,
  NxComplexContainer,
} from './containers';
import type { VisDef } from '../models';
import { LineConfigProvider } from '../core/line/config';
import { HeatmapConfigProvider } from '../core/heatmap/config';
import ComplexToolbar from '../../toolbar/ComplexToolbar';
import { ComplexConfigProvider } from '../core/complex/config';

export enum NexusVis {
  NxSpectrum = 'NX Spectrum',
  NxImage = 'NX Image',
  NxComplex = 'NX Complex',
}

export const NEXUS_VIS: Record<NexusVis, VisDef> = {
  [NexusVis.NxSpectrum]: {
    name: NexusVis.NxSpectrum,
    Icon: FiActivity,
    Toolbar: LineToolbar,
    Container: NxSpectrumContainer,
    ConfigProvider: LineConfigProvider,
  },

  [NexusVis.NxImage]: {
    name: NexusVis.NxImage,
    Icon: FiMap,
    Toolbar: HeatmapToolbar,
    Container: NxImageContainer,
    ConfigProvider: HeatmapConfigProvider,
  },

  [NexusVis.NxComplex]: {
    name: NexusVis.NxImage,
    Icon: FiMap,
    Toolbar: ComplexToolbar,
    Container: NxComplexContainer,
    ConfigProvider: ComplexConfigProvider,
  },
};
