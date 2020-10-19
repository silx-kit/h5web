import type { ElementType } from 'react';
import { FiCode, FiGrid, FiActivity, FiMap, FiCpu } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { Vis } from '../dataset-visualizer/models';
import LineToolbar from '../toolbar/LineToolbar';
import HeatmapToolbar from '../toolbar/HeatmapToolbar';
import type { HDF5Entity, HDF5Metadata } from '../providers/models';
import {
  isScalarShape,
  isBaseType,
  isSimpleShape,
  isNumericType,
  isDataset,
  isGroup,
} from '../providers/utils';
import RawViscontainer from './RawVisContainer';
import type { VisContainerProps } from './shared/models';
import ScalarVisContainer from './ScalarVisContainer';
import MatrixVisContainer from './matrix/MatrixVisContainer';
import LineVisContainer from './line/LineVisContainer';
import HeatmapVisContainer from './heatmap/HeatmapVisContainer';
import NxSpectrumContainer from './nexus/NxSpectrumContainer';
import {
  isNxDataGroup,
  getSignalDataset,
  getAttributeValue,
  isNxInterpretation,
} from './nexus/utils';
import { NxInterpretation } from './nexus/models';
import NxImageContainer from './nexus/NxImageContainer';

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
      if (!isGroup(entity) || !isNxDataGroup(entity)) {
        return false;
      }

      const dataset = getSignalDataset(entity, metadata);
      if (!dataset) {
        return false;
      }

      const interpretation = getAttributeValue(dataset, 'interpretation');
      if (isNxInterpretation(interpretation)) {
        return interpretation === NxInterpretation.Spectrum;
      }

      return (
        isNumericType(dataset.type) &&
        isSimpleShape(dataset.shape) &&
        dataset.shape.dims.length === 1
      );
    },
  },

  [Vis.NxImage]: {
    Icon: FiMap,
    Toolbar: HeatmapToolbar,
    Container: NxImageContainer,
    supportsEntity: (entity, metadata) => {
      if (!isGroup(entity) || !isNxDataGroup(entity)) {
        return false;
      }

      const dataset = getSignalDataset(entity, metadata);
      if (!dataset) {
        return false;
      }

      const interpretation = getAttributeValue(dataset, 'interpretation');
      if (isNxInterpretation(interpretation)) {
        return interpretation === NxInterpretation.Image;
      }

      return (
        isNumericType(dataset.type) &&
        isSimpleShape(dataset.shape) &&
        dataset.shape.dims.length >= 2
      );
    },
  },
};
