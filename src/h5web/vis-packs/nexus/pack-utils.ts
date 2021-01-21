import type { FetchStore } from 'react-suspense-fetch';
import { assertDefined, assertStr, isGroup } from '../../guards';
import type { HDF5Value } from '../../providers/hdf5-models';
import type { Entity } from '../../providers/models';
import { buildEntityPath } from '../../utils';
import type { VisDef } from '../models';
import { NxInterpretation } from './models';
import { findSignalDataset, getAttributeValue, isNxDataGroup } from './utils';
import { NEXUS_VIS } from './visualizations';

export function getDefaultEntity(
  entity: Entity,
  entitiesStore: FetchStore<Entity, string>
): Entity {
  const defaultPath = getAttributeValue(entity, 'default');
  if (defaultPath === undefined) {
    return entity;
  }

  assertStr(defaultPath, `Expected 'default' attribute to be a string`);
  const path = defaultPath.startsWith('/')
    ? defaultPath
    : buildEntityPath(entity.path, defaultPath);

  const defaultEntity = entitiesStore.get(path);
  assertDefined(defaultEntity, `Expected entity at path "${path}"`);

  return getDefaultEntity(defaultEntity, entitiesStore);
}

function isNxInterpretation(
  attrValue: HDF5Value
): attrValue is NxInterpretation {
  return (
    typeof attrValue === 'string' &&
    Object.values<string>(NxInterpretation).includes(attrValue)
  );
}

export function getSupportedVis(entity: Entity): VisDef | undefined {
  if (!isGroup(entity) || !isNxDataGroup(entity)) {
    return undefined;
  }

  const dataset = findSignalDataset(entity);
  const interpretation = getAttributeValue(dataset, 'interpretation');

  if (isNxInterpretation(interpretation)) {
    return NEXUS_VIS[interpretation];
  }

  return dataset.shape.dims.length >= 2 ? NEXUS_VIS.image : NEXUS_VIS.spectrum;
}
