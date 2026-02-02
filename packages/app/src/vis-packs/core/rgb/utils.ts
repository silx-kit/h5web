import { hasScalarShape, hasStringType } from '@h5web/shared/guards';
import { type Dataset } from '@h5web/shared/hdf5-models';

import { type AttrValuesStore } from '../../../providers/models';
import { findAttribute, getAttributeValue } from '../../../utils';

export function assertSubclassIfPresent(
  dataset: Dataset,
  attrValuesStore: AttrValuesStore,
): void {
  const subClassAttr = findAttribute(dataset, 'IMAGE_SUBCLASS');

  if (
    subClassAttr &&
    hasScalarShape(subClassAttr) &&
    hasStringType(subClassAttr) &&
    getAttributeValue(dataset, subClassAttr, attrValuesStore) !==
      'IMAGE_TRUECOLOR'
  ) {
    throw new Error('RGB visualization supports only IMAGE_TRUECOLOR');
  }
}
