import type { ElementType } from 'react';
import { FiCode, FiGrid, FiActivity, FiMap, FiCpu } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import LineToolbar from '../toolbar/LineToolbar';
import HeatmapToolbar from '../toolbar/HeatmapToolbar';
import type { MyHDF5Entity } from '../providers/models';
import {
  hasMyScalarShape,
  hasMyBaseType,
  hasMySimpleShape,
  hasMyNumericType,
  isMyDataset,
  isMyGroup,
} from '../providers/utils';
import type { VisContainerProps } from './containers/models';
import {
  getAttributeValue,
  isNxInterpretation,
  findSignalName,
  findMyNxDataGroup,
  findMySignalDataset,
} from './nexus/utils';
import { NxInterpretation } from './nexus/models';
import {
  RawViscontainer,
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
  supportsEntity: (entity: MyHDF5Entity) => boolean;
}

export const VIS_DEFS: Record<Vis, VisDef> = {
  [Vis.Raw]: {
    Icon: FiCpu,
    Container: RawViscontainer,
    supportsEntity: isMyDataset,
  },

  [Vis.Scalar]: {
    Icon: FiCode,
    Container: ScalarVisContainer,
    supportsEntity: (entity) => {
      return (
        isMyDataset(entity) && hasMyBaseType(entity) && hasMyScalarShape(entity)
      );
    },
  },

  [Vis.Matrix]: {
    Icon: FiGrid,
    Container: MatrixVisContainer,
    supportsEntity: (entity) => {
      return (
        isMyDataset(entity) &&
        hasMyBaseType(entity) &&
        hasMySimpleShape(entity) &&
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
        isMyDataset(entity) &&
        hasMyNumericType(entity) &&
        hasMySimpleShape(entity) &&
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
        isMyDataset(entity) &&
        hasMyNumericType(entity) &&
        hasMySimpleShape(entity) &&
        entity.shape.dims.length >= 2
      );
    },
  },

  [Vis.NxSpectrum]: {
    Icon: FiActivity,
    Toolbar: NxSpectrumToolbar,
    Container: NxSpectrumContainer,
    supportsEntity: (entity) => {
      if (!isMyGroup(entity)) {
        return false;
      }

      const group = findMyNxDataGroup(entity);
      if (!group) {
        return false; // entity is not a group or doesn't have a `default` attribute
      }

      const signal = findSignalName(group);
      const dataset = findMySignalDataset(group, signal);
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
    supportsEntity: (entity) => {
      if (!isMyGroup(entity)) {
        return false;
      }

      const group = findMyNxDataGroup(entity);
      if (!group) {
        return false; // entity is not a group or doesn't have a `default` attribute
      }

      const signal = findSignalName(group);
      const dataset = findMySignalDataset(group, signal);
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
