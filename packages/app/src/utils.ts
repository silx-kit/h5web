import type { Entity } from '@h5web/shared/hdf5-models';

import type { AttrName } from './providers/models';

export function hasAttribute(entity: Entity, attributeName: AttrName) {
  return entity.attributes.some((attr) => attr.name === attributeName);
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
