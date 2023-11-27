import type { DType } from '@h5web/shared/models-hdf5';
import { DTypeClass, Endianness, EntityKind } from '@h5web/shared/models-hdf5';

import type {
  H5GroveDatasetResponse,
  H5GroveDtype,
  H5GroveEntityResponse,
  H5GroveExternalLinkResponse,
  H5GroveGroupResponse,
  H5GroveSoftLinkResponse,
} from './models';

// https://numpy.org/doc/stable/reference/generated/numpy.dtype.byteorder.html#numpy.dtype.byteorder
const ENDIANNESS_MAPPING: Record<string, Endianness> = {
  '<': Endianness.LE,
  '>': Endianness.BE,
};

export function isGroupResponse(
  response: H5GroveEntityResponse,
): response is H5GroveGroupResponse {
  return response.type === EntityKind.Group;
}

export function isDatasetResponse(
  response: H5GroveEntityResponse,
): response is H5GroveDatasetResponse {
  return response.type === EntityKind.Dataset;
}

export function isSoftLinkResponse(
  response: H5GroveEntityResponse,
): response is H5GroveSoftLinkResponse {
  return response.type === 'soft_link';
}

export function isExternalLinkResponse(
  response: H5GroveEntityResponse,
): response is H5GroveExternalLinkResponse {
  return response.type === 'external_link';
}

export function convertH5GroveDtype(dtype: H5GroveDtype): DType {
  if (typeof dtype === 'string') {
    return convertDtypeString(dtype);
  }

  return {
    class: DTypeClass.Compound,
    fields: Object.fromEntries(
      Object.entries(dtype).map(([k, v]) => [k, convertH5GroveDtype(v)]),
    ),
  };
}

function convertDtypeString(dtype: string): DType {
  const regexp = /([<>=|])?([A-Za-z])(\d*)/u;
  const matches = regexp.exec(dtype);

  if (matches === null) {
    throw new Error(`Invalid dtype string: ${dtype}`);
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

export function hasErrorMessage(error: unknown): error is { message: string } {
  return !!error && typeof error === 'object' && 'message' in error;
}
