import type { AxisParams } from '@h5web/lib';
import type { DType, Primitive } from '@h5web/shared';

export type AxisMapping = (AxisParams | undefined)[];

export type ImageAttribute = 'CLASS' | 'IMAGE_SUBCLASS';

export type ValueFormatter<T extends DType> = (val: Primitive<T>) => string;
