import { type DType, type Primitive } from '@h5web/shared';

export type ImageAttribute = 'CLASS' | 'IMAGE_SUBCLASS';

export type ValueFormatter<T extends DType> = (val: Primitive<T>) => string;
