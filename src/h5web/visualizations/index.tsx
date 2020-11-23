import type { ElementType } from 'react';
import { FiCode, FiGrid, FiActivity, FiMap, FiCpu } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import LineToolbar from '../toolbar/LineToolbar';
import HeatmapToolbar from '../toolbar/HeatmapToolbar';
import type { HDF5Entity, HDF5Metadata } from '../providers/models';
import {
  hasScalarShape,
  hasBaseType,
  hasSimpleShape,
  hasNumericType,
  isDataset,
  assertDataset,
  assertNumericType,
  assertSimpleShape,
  isGroup,
  getLinkedEntity,
} from '../providers/utils';
import type { VisContainerProps } from './containers/models';
import {
  getAttributeValue,
  findNxDataGroup,
  isNxInterpretation,
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
import { assertDefined, assertStr } from './shared/utils';
import NxSpectrumToolbar from '../toolbar/NxSpectrumToolbar';
import { ToolbarProps } from '../toolbar/Toolbar';

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
        return false; // entity is not a group or doesn't have a `default` attribute
      }

      const signal = getAttributeValue(group, 'signal');
      assertDefined(signal, "Expected 'signal' attribute");
      assertStr(signal, "Expected 'signal' attribute to be a string");

      const dataset = getLinkedEntity(signal, group, metadata);
      assertDefined(dataset, `Expected "${signal}" signal entity to exist`);
      assertDataset(dataset, `Expected "${signal}" signal to be a dataset`);
      assertNumericType(dataset);
      assertSimpleShape(dataset);

      const interpretation = getAttributeValue(dataset, 'interpretation');
      if (isNxInterpretation(interpretation)) {
        return interpretation === NxInterpretation.Spectrum;
      }

      return true;
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
        return false; // entity is not a group or doesn't have a `default` attribute
      }

      const signal = getAttributeValue(group, 'signal');
      assertDefined(signal, "Expected 'signal' attribute");
      assertStr(signal, "Expected 'signal' attribute to be a string");

      const dataset = getLinkedEntity(signal, group, metadata);
      assertDefined(dataset, `Expected "${signal}" signal entity to exist`);
      assertDataset(dataset, `Expected "${signal}" signal to be a dataset`);

      assertNumericType(dataset);
      assertSimpleShape(dataset);

      if (dataset.shape.dims.length < 2) {
        return false;
      }

      const interpretation = getAttributeValue(dataset, 'interpretation');
      if (isNxInterpretation(interpretation)) {
        return interpretation === NxInterpretation.Image;
      }

      return true;
    },
  },
};
