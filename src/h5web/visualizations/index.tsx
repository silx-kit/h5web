import type { ElementType } from 'react';
import { FiCode, FiGrid, FiActivity, FiMap, FiCpu } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import LineToolbar from '../toolbar/LineToolbar';
import HeatmapToolbar from '../toolbar/HeatmapToolbar';
import type { Entity, Metadata } from '../providers/models';
import {
  hasScalarShape,
  hasBaseType,
  hasSimpleShape,
  hasNumericType,
  isDataset,
  isGroup,
} from '../guards';
import type { VisContainerProps } from './containers/models';
import {
  getAttributeValue,
  isNxInterpretation,
  findNxDataGroup,
  findSignalDataset,
} from './nexus/utils';
import { NxInterpretation } from './nexus/models';
import {
  RawVisContainer,
  ScalarVisContainer,
  MatrixVisContainer,
  LineVisContainer,
  HeatmapVisContainer,
  NxSpectrumContainer,
  NxImageContainer,
} from './containers';
import NxSpectrumToolbar from '../toolbar/NxSpectrumToolbar';
import type { ToolbarProps } from '../toolbar/Toolbar';

export enum Vis {
  Raw = 'Raw',
  Scalar = 'Scalar',
  Matrix = 'Matrix',
  Line = 'Line',
  Heatmap = 'Heatmap',
  NxSpectrum = 'NX Spectrum',
  NxImage = 'NX Image',
}

interface VisDef {
  Icon: IconType;
  Toolbar?: ElementType<ToolbarProps>;
  Container: ElementType<VisContainerProps>;
  supportsEntity: (entity: Entity, metadata: Metadata) => boolean;
}

export const VIS_DEFS: Record<Vis, VisDef> = {
  [Vis.Raw]: {
    Icon: FiCpu,
    Container: RawVisContainer,
    supportsEntity: isDataset,
  },

  [Vis.Scalar]: {
    Icon: FiCode,
    Container: ScalarVisContainer,
    supportsEntity: (entity) => {
      return isDataset(entity) && hasBaseType(entity) && hasScalarShape(entity);
    },
  },

  [Vis.Matrix]: {
    Icon: FiGrid,
    Container: MatrixVisContainer,
    supportsEntity: (entity) => {
      return (
        isDataset(entity) &&
        hasBaseType(entity) &&
        hasSimpleShape(entity) &&
        entity.shape.dims.length >= 1
      );
    },
  },

  [Vis.Line]: {
    Icon: FiActivity,
    Toolbar: LineToolbar,
    Container: LineVisContainer,
    supportsEntity: (entity) => {
      return (
        isDataset(entity) &&
        hasNumericType(entity) &&
        hasSimpleShape(entity) &&
        entity.shape.dims.length >= 1
      );
    },
  },

  [Vis.Heatmap]: {
    Icon: FiMap,
    Toolbar: HeatmapToolbar,
    Container: HeatmapVisContainer,
    supportsEntity: (entity) => {
      return (
        isDataset(entity) &&
        hasNumericType(entity) &&
        hasSimpleShape(entity) &&
        entity.shape.dims.length >= 2
      );
    },
  },

  [Vis.NxSpectrum]: {
    Icon: FiActivity,
    Toolbar: NxSpectrumToolbar,
    Container: NxSpectrumContainer,
    supportsEntity: (entity, metadata) => {
      if (!isGroup(entity)) {
        return false;
      }

      const group = findNxDataGroup(entity, metadata);
      if (!group) {
        return false; // group is not NXdata and doesn't have `default` attribute
      }

      const dataset = findSignalDataset(group);
      const interpretation = getAttributeValue(dataset, 'interpretation');

      return (
        !isNxInterpretation(interpretation) ||
        interpretation === NxInterpretation.Spectrum
      );
    },
  },

  [Vis.NxImage]: {
    Icon: FiMap,
    Toolbar: HeatmapToolbar,
    Container: NxImageContainer,
    supportsEntity: (entity, metadata) => {
      if (!isGroup(entity)) {
        return false;
      }

      const group = findNxDataGroup(entity, metadata);
      if (!group) {
        return false; // group is not NXdata and doesn't have `default` attribute
      }

      const dataset = findSignalDataset(group);
      if (dataset.shape.dims.length < 2) {
        return false;
      }

      const interpretation = getAttributeValue(dataset, 'interpretation');
      return (
        !isNxInterpretation(interpretation) ||
        interpretation === NxInterpretation.Image
      );
    },
  },
};
