import {
  assertGroupWithChildren,
  assertStr,
  buildEntityPath,
  hasComplexType,
  hasMinDims,
  hasNumDims,
  isGroup,
} from '@h5web/shared';
import type { Entity } from '@h5web/shared';

import { getAttributeValue } from '../../utils';
import type { VisDef } from '../models';
import { NxInterpretation } from './models';
import { findSignalDataset, hasNxClass, isNxDataGroup } from './utils';
import { NexusVis, NEXUS_VIS } from './visualizations';

function getImplicitDefaultChild(children: Entity[]): Entity | undefined {
  const groups = children.filter(isGroup);

  // Look for an `NXdata` child group first
  const nxDataChild = groups.find((g) => hasNxClass(g, 'NXdata'));
  if (nxDataChild) {
    return nxDataChild;
  }

  // Then for an `NXentry` child group
  const nxEntryChild = groups.find((g) => hasNxClass(g, 'NXentry'));
  if (nxEntryChild) {
    return nxEntryChild;
  }

  // Then for an `NXprocess` child group
  return groups.find((g) => hasNxClass(g, 'NXprocess'));
}

export function getNxDefaultPath(entity: Entity): string | undefined {
  if (!isGroup(entity)) {
    return undefined;
  }

  const defaultPath = getAttributeValue(entity, 'default');

  if (defaultPath) {
    assertStr(defaultPath, `Expected 'default' attribute to be a string`);

    return defaultPath.startsWith('/')
      ? defaultPath
      : buildEntityPath(entity.path, defaultPath);
  }

  assertGroupWithChildren(entity);
  return getImplicitDefaultChild(entity.children)?.path;
}

export function getSupportedNxVis(entity: Entity): VisDef | undefined {
  if (!isGroup(entity) || !isNxDataGroup(entity)) {
    return undefined;
  }

  assertGroupWithChildren(entity);
  const dataset = findSignalDataset(entity);
  const isCplx = hasComplexType(dataset);
  const interpretation = getAttributeValue(dataset, 'interpretation');

  if (
    interpretation === NxInterpretation.RGB &&
    hasNumDims(dataset, 3) &&
    !isCplx
  ) {
    return NEXUS_VIS[NexusVis.NxRGB];
  }

  const imageVis = isCplx ? NexusVis.NxComplexImage : NexusVis.NxImage;
  const spectrumVis = isCplx ? NexusVis.NxComplexSpectrum : NexusVis.NxSpectrum;

  if (interpretation === NxInterpretation.Image) {
    return NEXUS_VIS[imageVis];
  }

  if (interpretation === NxInterpretation.Spectrum) {
    return NEXUS_VIS[spectrumVis];
  }

  return NEXUS_VIS[hasMinDims(dataset, 2) ? imageVis : spectrumVis];
}
