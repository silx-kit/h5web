import {
  hasComplexType,
  hasMinDims,
  hasNumDims,
  isGroup,
} from '@h5web/shared/guards';
import { type GroupWithChildren } from '@h5web/shared/hdf5-models';
import { NxInterpretation } from '@h5web/shared/nexus-models';
import { FiActivity, FiFileText, FiImage, FiMap } from 'react-icons/fi';
import { MdGrain } from 'react-icons/md';

import { type AttrValuesStore } from '../../providers/models';
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
import { findAxesDatasets, getSignal, isNxNoteGroup } from './utils';

export enum NexusVis {
  NxLine = 'NX Line',
  NxComplexLine = 'NX Complex Line',
  NxHeatmap = 'NX Heatmap',
  NxRGB = 'NX RGB',
  NxScatter = 'NX Scatter',
  NxNote = 'NX Note',
}

export interface NexusVisDef extends VisDef {
  supportsGroup: (
    group: GroupWithChildren,
    attrValuesStore: AttrValuesStore,
  ) => boolean;
}

export const NEXUS_VIS = {
  [NexusVis.NxLine]: {
    name: NexusVis.NxLine,
    Icon: FiActivity,
    Container: NxLineContainer,
    ConfigProvider: LineConfigProvider,
    supportsGroup: (group, attrValuesStore) => {
      const signal = getSignal(group, attrValuesStore);
      return !!signal && !hasComplexType(signal);
    },
    isPrimary: (entity, attrValuesStore) => {
      const signal = isGroup(entity)
        ? getSignal(entity, attrValuesStore)
        : undefined;

      return (
        !!signal &&
        attrValuesStore.getSingle(signal, 'interpretation') ===
          NxInterpretation.Spectrum
      );
    },
  },

  [NexusVis.NxComplexLine]: {
    name: NexusVis.NxLine,
    Icon: FiActivity,
    Container: NxComplexLineContainer,
    ConfigProvider: LineConfigProvider,
    supportsGroup: (group, attrValuesStore) => {
      const signal = getSignal(group, attrValuesStore);
      return !!signal && hasComplexType(signal);
    },
    isPrimary: (entity, attrValuesStore) => {
      const signal = isGroup(entity)
        ? getSignal(entity, attrValuesStore)
        : undefined;

      return (
        !!signal &&
        attrValuesStore.getSingle(signal, 'interpretation') ===
          NxInterpretation.Spectrum
      );
    },
  },

  [NexusVis.NxHeatmap]: {
    name: NexusVis.NxHeatmap,
    Icon: FiMap,
    Container: NxHeatmapContainer,
    ConfigProvider: HeatmapConfigProvider,
    supportsGroup: (group, attrValuesStore) => {
      const signal = getSignal(group, attrValuesStore);
      return !!signal && hasMinDims(signal, 2);
    },
    isPrimary: (entity, attrValuesStore) => {
      const signal = isGroup(entity)
        ? getSignal(entity, attrValuesStore)
        : undefined;

      return (
        !!signal &&
        attrValuesStore.getSingle(signal, 'interpretation') ===
          NxInterpretation.Image
      );
    },
  },

  [NexusVis.NxRGB]: {
    name: NexusVis.NxRGB,
    Icon: FiImage,
    Container: NxRgbContainer,
    ConfigProvider: RgbConfigProvider,
    supportsGroup: (group, attrValuesStore) => {
      const signal = getSignal(group, attrValuesStore);
      if (!signal) {
        return false;
      }

      const { interpretation, CLASS } = attrValuesStore.get(signal);
      return (
        (interpretation === NxInterpretation.RGB || CLASS === 'IMAGE') &&
        hasMinDims(signal, 3) && // 2 for axes + 1 for RGB channels
        signal.shape[signal.shape.length - 1] === 3 && // 3 channels
        !hasComplexType(signal)
      );
    },
    isPrimary: () => true, // always primary if supported
  },

  [NexusVis.NxScatter]: {
    name: NexusVis.NxScatter,
    Icon: MdGrain,
    Container: NxScatterContainer,
    ConfigProvider: ScatterConfigProvider,
    supportsGroup: (group, attrValuesStore) => {
      const signal = getSignal(group, attrValuesStore);
      if (!signal || !hasNumDims(signal, 1)) {
        return false;
      }

      const axisDatasets = findAxesDatasets(group, signal, attrValuesStore);
      return (
        axisDatasets.length === 2 &&
        axisDatasets.every((d) => d && hasNumDims(d, 1))
      );
    },
    isPrimary: () => true, // always primary if supported
  },

  [NexusVis.NxNote]: {
    name: NexusVis.NxNote,
    Icon: FiFileText,
    Container: NxNoteContainer,
    supportsGroup: isNxNoteGroup,
    isPrimary: () => true, // always primary if supported
  },
} satisfies Record<NexusVis, NexusVisDef>;
