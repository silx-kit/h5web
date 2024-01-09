import type { DType, Primitive } from '@h5web/shared/hdf5-models';

export type ImageAttribute = 'CLASS' | 'IMAGE_SUBCLASS';

export type ValueFormatter<T extends DType> = (val: Primitive<T>) => string;
