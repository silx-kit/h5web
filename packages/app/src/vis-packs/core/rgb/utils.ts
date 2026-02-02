import { type Dataset } from '@h5web/shared/hdf5-models';

import { type AttrValuesStore } from '../../../providers/models';
import { findScalarStrAttr, getAttributeValue } from '../../../utils';

export function assertImageSubclassIfPresent(
  dataset: Dataset,
  attrValuesStore: AttrValuesStore,
): void {
  const subClassAttr = findScalarStrAttr(dataset, 'IMAGE_SUBCLASS');

  if (
    subClassAttr &&
    getAttributeValue(dataset, subClassAttr, attrValuesStore) !==
      'IMAGE_TRUECOLOR'
  ) {
    throw new Error('RGB visualization supports only IMAGE_TRUECOLOR');
  }
}
