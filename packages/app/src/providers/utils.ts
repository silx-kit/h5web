import type { ArrayShape, Dataset, DType } from '@h5web/shared';
import { Endianness, DTypeClass, assertArray } from '@h5web/shared';
import axios from 'axios';

export const CANCELLED_ERROR_MSG = 'Request cancelled';

// https://numpy.org/doc/stable/reference/generated/numpy.dtype.byteorder.html#numpy.dtype.byteorder
const ENDIANNESS_MAPPING: Record<string, Endianness> = {
  '<': Endianness.LE,
  '>': Endianness.BE,
};

export function convertDtype(dtype: string): DType {
  const regexp = /([<>=|])?([A-z])(\d*)/u;
  const matches = regexp.exec(dtype);

  if (matches === null) {
    throw new Error(`Unknown dtype ${dtype}`);
  }

  const [, endianMatch, dataType, lengthMatch] = matches;

  const length = lengthMatch ? Number.parseInt(lengthMatch, 10) : 0;
  const endianness = ENDIANNESS_MAPPING[endianMatch] || undefined;

  switch (dataType) {
    case 'b':
      // Booleans are stored as bytes but numpy represents them distinctly from "normal" bytes:
      // `|b1` for booleans vs. `|i1` for normal bytes
      // https://numpy.org/doc/stable/reference/arrays.scalars.html#numpy.bool
      return { class: DTypeClass.Bool };

    case 'f':
      return {
        class: DTypeClass.Float,
        size: length * 8,
        endianness,
      };

    case 'i':
      return {
        class: DTypeClass.Integer,
        size: length * 8,
        endianness,
      };

    case 'u':
      return {
        class: DTypeClass.Unsigned,
        size: length * 8,
        endianness,
      };

    case 'c':
      return {
        class: DTypeClass.Complex,
        realType: {
          class: DTypeClass.Float,
          size: length * 4, // Bytes are equally distributed between real and imag
          endianness,
        },
        imagType: {
          class: DTypeClass.Float,
          size: length * 4, // Bytes are equally distributed between real and imag
          endianness,
        },
      };

    case 'S':
      return {
        class: DTypeClass.String,
        charSet: 'ASCII',
        length,
      };

    case 'O':
      return { class: DTypeClass.String, charSet: 'UTF-8' };

    default:
      return { class: DTypeClass.Unknown };
  }
}

export function flattenValue(
  value: unknown,
  dataset: Dataset<ArrayShape>,
  selection?: string
): unknown[] {
  assertArray(value);
  const slicedDims = selection?.split(',').filter((s) => s.includes(':'));
  const dims = slicedDims || dataset.shape;
  return value.flat(dims.length - 1);
}

export async function handleAxiosError<T>(
  func: () => Promise<T>,
  getErrorToThrow: (status: number, errorData: unknown) => string | undefined
): Promise<T> {
  try {
    return await func();
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      const errorToThrow = getErrorToThrow(status, data);

      if (errorToThrow) {
        throw new Error(errorToThrow);
      }
    }

    throw error;
  }
}

export function getNameFromPath(path: string) {
  const segments = path.split('/');
  return segments[segments.length - 1];
}
