import { FiActivity, FiMap } from 'react-icons/fi';
import HeatmapToolbar from '../../toolbar/HeatmapToolbar';
import LineToolbar from '../../toolbar/LineToolbar';
import { NxSpectrumContainer, NxImageContainer } from './containers';
import { NxInterpretation } from './models';
import type { VisDef } from '../models';

export enum NexusVis {
  NxSpectrum = 'NX Spectrum',
  NxImage = 'NX Image',
}

export const NEXUS_VIS: Record<NxInterpretation, VisDef> = {
  [NxInterpretation.Spectrum]: {
    name: NexusVis.NxSpectrum,
    Icon: FiActivity,
    Toolbar: LineToolbar,
    Container: NxSpectrumContainer,
  },

  [NxInterpretation.Image]: {
    name: NexusVis.NxImage,
    Icon: FiMap,
    Toolbar: HeatmapToolbar,
    Container: NxImageContainer,
  },
};
