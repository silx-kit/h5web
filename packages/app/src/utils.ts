import {
  assertValue,
  hasNumericType,
  hasScalarShape,
  hasStringType,
} from '@h5web/shared/guards';
import {
  type ArrayShape,
  type Attribute,
  type Entity,
  type NumericType,
  type ScalarShape,
  type StringType,
  type Value,
} from '@h5web/shared/hdf5-models';

import { type DataContextValue } from './providers/DataProvider';

export function hasAttribute(entity: Entity, attributeName: string): boolean {
  return entity.attributes.some((attr) => attr.name === attributeName);
}

export function findAttribute(
  entity: Entity,
  attributeName: string,
): Attribute | undefined {
  return entity.attributes.find((attr) => attr.name === attributeName);
}

export function findScalarNumAttr(
  entity: Entity,
  attributeName: string,
): Attribute<ScalarShape, NumericType> | undefined {
  const attr = findAttribute(entity, attributeName);
  return attr && hasScalarShape(attr) && hasNumericType(attr)
    ? attr
    : undefined;
}

export function findScalarStrAttr(
  entity: Entity,
  attributeName: string,
): Attribute<ScalarShape, StringType> | undefined {
  const attr = findAttribute(entity, attributeName);
  return attr && hasScalarShape(attr) && hasStringType(attr) ? attr : undefined;
}

export async function getAttributeValue<
  A extends Attribute<ScalarShape | ArrayShape>,
>(
  entity: Entity,
  attribute: A,
  dataContext: DataContextValue,
): Promise<Value<A>>;

export async function getAttributeValue<
  A extends Attribute<ScalarShape | ArrayShape>,
>(
  entity: Entity,
  attribute: A | undefined,
  dataContext: DataContextValue,
): Promise<Value<A> | undefined>;

export async function getAttributeValue<
  A extends Attribute<ScalarShape | ArrayShape>,
>(
  entity: Entity,
  attribute: A | undefined,
  dataContext: DataContextValue,
): Promise<Value<A> | undefined> {
  if (!attribute) {
    return undefined;
  }

  const { queryClient, queries } = dataContext;
  const values = await queryClient.query(queries.attrValues(entity));

  const value = values[attribute.name];
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
