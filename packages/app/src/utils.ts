import { assertValue } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type Attribute,
  type Entity,
  type ScalarShape,
  type Value,
} from '@h5web/shared/hdf5-models';

import { type AttrName, type AttrValuesStore } from './providers/models';

export function hasAttribute(entity: Entity, attributeName: AttrName): boolean {
  return entity.attributes.some((attr) => attr.name === attributeName);
}

export function findAttribute(
  entity: Entity,
  attributeName: AttrName,
): Attribute | undefined {
  return entity.attributes.find((attr) => attr.name === attributeName);
}

export function getAttributeValue<
  A extends Attribute<ScalarShape | ArrayShape>,
>(entity: Entity, attribute: A, attrValuesStore: AttrValuesStore): Value<A> {
  const value = attrValuesStore.get(entity)[attribute.name];
  assertValue(value, attribute);
  return value;
}

export function enableBigIntSerialization(): void {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(BigInt.prototype, 'toJSON', {
    configurable: true,
    value: function toJSON(this: bigint) {
      return `${this.toString()}n`;
    },
  });
}
