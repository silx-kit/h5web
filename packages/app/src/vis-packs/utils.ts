import { hasArrayShape } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type Dataset,
  type DType,
  DTypeClass,
  type ScalarShape,
} from '@h5web/shared/hdf5-models';

// Above this size, values are fetched only once the user has confirmed
export const MAX_AUTO_FETCH_SIZE = 500e6; // bytes

// Rough estimate for types of unknown size (e.g. variable-length strings)
const DEFAULT_ELEMENT_SIZE = 8; // bytes

const BYTES_FORMAT = new Intl.NumberFormat('en', {
  style: 'unit',
  unit: 'gigabyte',
  maximumFractionDigits: 1,
});

const INDEX_REGEX = /^\d+$/u;
const RANGE_REGEX = /^(\d*):(\d*)(?::(\d+))?$/u;

/* Return size of type in bytes, or `undefined` if unknown (or zero) */
export function getDTypeSize(type: DType): number | undefined {
  const size = computeDTypeSize(type);
  return size && size > 0 ? size : undefined;
}

function computeDTypeSize(type: DType): number | undefined {
  switch (type.class) {
    case DTypeClass.Integer:
    case DTypeClass.Float:
      return type.size / 8;

    case DTypeClass.Bool:
    case DTypeClass.Enum:
      return getDTypeSize(type.base);

    case DTypeClass.Complex:
      return sumSizes([type.realType, type.imagType]);

    case DTypeClass.String:
      return type.length;

    case DTypeClass.Compound:
      return sumSizes([...type.fields.values()]);

    case DTypeClass.Array: {
      const baseSize = getDTypeSize(type.base);
      return baseSize && type.dims.reduce((acc, dim) => acc * dim, baseSize);
    }

    default:
      return undefined;
  }
}

function sumSizes(types: DType[]): number | undefined {
  const sizes = types.map(getDTypeSize);
  return sizes.every((size) => size !== undefined)
    ? sizes.reduce((acc, size) => acc + size, 0)
    : undefined;
}

/* Number of elements selected in a dimension by `index`, `:` or `start:stop[:step]`;
 * unsupported formats are assumed to select the whole dimension. */
function getSlicingLength(slicing: string, dim: number): number {
  if (INDEX_REGEX.test(slicing)) {
    return 1;
  }

  const match = RANGE_REGEX.exec(slicing);
  if (!match) {
    return dim;
  }

  const [, start, stop, step] = match;
  const startIndex = start ? Math.min(Number(start), dim) : 0;
  const stopIndex = stop ? Math.min(Number(stop), dim) : dim;
  const stepSize = Number(step) || 1;

  return Math.max(Math.ceil((stopIndex - startIndex) / stepSize), 0);
}

/* Estimate size in bytes of the value of a dataset or of a selection in it */
export function getValueSize(
  dataset: Dataset<ScalarShape | ArrayShape>,
  selection?: string,
): number {
  const slicings = selection?.split(',') ?? [];
  const count = hasArrayShape(dataset)
    ? dataset.shape.dims.reduce(
        (acc, dim, i) => acc * getSlicingLength(slicings[i] ?? ':', dim),
        1,
      )
    : 1;

  return count * (getDTypeSize(dataset.type) ?? DEFAULT_ELEMENT_SIZE);
}

export function formatBytes(size: number): string {
  return BYTES_FORMAT.format(size / 1e9);
}
