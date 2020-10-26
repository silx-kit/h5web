import type { ElementType } from 'react';
import { FiCode, FiGrid, FiActivity, FiMap, FiCpu } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import LineToolbar from '../toolbar/LineToolbar';
import HeatmapToolbar from '../toolbar/HeatmapToolbar';
import type { HDF5Entity, HDF5Metadata } from '../providers/models';
import {
  isScalarShape,
  isBaseType,
  isSimpleShape,
  isNumericType,
  isDataset,
} from '../providers/utils';
import type { VisContainerProps } from './containers/models';
import {
  getAttributeValue,
  isNxInterpretation,
  getLinkedEntity,
  getNxDataGroup,
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
  Toolbar?: ElementType<{}>;
  Container: ElementType<VisContainerProps>;
  supportsEntity(entity: HDF5Entity, metadata: HDF5Metadata): boolean;
}

export const VIS_DEFS: Record<Vis, VisDef> = {
  [Vis.Raw]: {
    Icon: FiCpu,
    Container: RawViscontainer,
    supportsEntity: isDataset,
  },

  [Vis.Scalar]: {
    Icon: FiCode,
    Container: ScalarVisContainer,
    supportsEntity: (entity) => {
      return (
        isDataset(entity) &&
        isBaseType(entity.type) &&
        isScalarShape(entity.shape)
      );
    },
  },

  [Vis.Matrix]: {
    Icon: FiGrid,
    Container: MatrixVisContainer,
    supportsEntity: (entity) => {
      return (
        isDataset(entity) &&
        isBaseType(entity.type) &&
        isSimpleShape(entity.shape) &&
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
        isNumericType(entity.type) &&
        isSimpleShape(entity.shape) &&
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
        isNumericType(entity.type) &&
        isSimpleShape(entity.shape) &&
        entity.shape.dims.length >= 2
      );
    },
  },

  [Vis.NxSpectrum]: {
    Icon: FiActivity,
    Toolbar: LineToolbar,
    Container: NxSpectrumContainer,
    supportsEntity: (entity, metadata) => {
      const group = getNxDataGroup(entity, metadata);

      if (!group) {
        return false;
      }

      const signal = getAttributeValue(group, 'signal');
      if (typeof signal !== 'string') {
        return false;
      }

      const dataset = getLinkedEntity(group, metadata, signal);
      if (
        !dataset ||
        !isDataset(dataset) ||
        !isNumericType(dataset.type) ||
        !isSimpleShape(dataset.shape)
      ) {
        return false;
      }

      const dimsCount = dataset.shape.dims.length;
      if (dimsCount === 0) {
        return false;
      }

      const interpretation = getAttributeValue(dataset, 'interpretation');
      return (
        (!isNxInterpretation(interpretation) && dimsCount === 1) || // NxImage already supports datasets with 2+ dimensions
        interpretation === NxInterpretation.Spectrum
      );
    },
  },

  [Vis.NxImage]: {
    Icon: FiMap,
    Toolbar: HeatmapToolbar,
    Container: NxImageContainer,
    supportsEntity: (entity, metadata) => {
      const group = getNxDataGroup(entity, metadata);

      if (!group) {
        return false;
      }

      const signal = getAttributeValue(group, 'signal');
      if (typeof signal !== 'string') {
        return false;
      }

      const dataset = getLinkedEntity(group, metadata, signal);
      if (
        !dataset ||
        !isDataset(dataset) ||
        !isNumericType(dataset.type) ||
        !isSimpleShape(dataset.shape)
      ) {
        return false;
      }

      const dimsCount = dataset.shape.dims.length;
      if (dimsCount < 2) {
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
