import { FiActivity, FiMap } from 'react-icons/fi';
import HeatmapToolbar from '../../toolbar/HeatmapToolbar';
import { NxInterpretation } from './models';
import { NxSpectrumContainer, NxImageContainer } from './containers';
import NxSpectrumToolbar from '../../toolbar/NxSpectrumToolbar';
import type { VisDef } from '../models';

export enum NexusVis {
  NxSpectrum = 'NX Spectrum',
  NxImage = 'NX Image',
}

export const NEXUS_VIS: Record<NxInterpretation, VisDef> = {
  [NxInterpretation.Spectrum]: {
    name: NexusVis.NxSpectrum,
    Icon: FiActivity,
    Toolbar: NxSpectrumToolbar,
    Container: NxSpectrumContainer,
  },

  [NxInterpretation.Image]: {
    name: NexusVis.NxImage,
    Icon: FiMap,
    Toolbar: HeatmapToolbar,
    Container: NxImageContainer,
  },
};
