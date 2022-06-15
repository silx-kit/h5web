import type { DType } from '@h5web/shared';
import {
  DTypeClass,
  Endianness,
  EntityKind,
  isNumericType,
} from '@h5web/shared';

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
  response: H5GroveEntityResponse
): response is H5GroveGroupResponse {
  return response.type === EntityKind.Group;
}

export function isDatasetResponse(
  response: H5GroveEntityResponse
): response is H5GroveDatasetResponse {
  return response.type === EntityKind.Dataset;
}

export function isSoftLinkResponse(
  response: H5GroveEntityResponse
): response is H5GroveSoftLinkResponse {
  return response.type === 'soft_link';
}

export function isExternalLinkResponse(
  response: H5GroveEntityResponse
): response is H5GroveExternalLinkResponse {
  return response.type === 'external_link';
}

export function typedArrayFromDType(dtype: DType) {
  /* Adapted from https://github.com/ludwigschubert/js-numpy-parser/blob/v1.2.3/src/main.js#L116 */
  if (!isNumericType(dtype)) {
    return undefined;
  }

  const { class: dtypeClass, size } = dtype;

  if (dtypeClass === DTypeClass.Integer) {
    switch (size) {
      case 8:
        return Int8Array;
      case 16:
        return Int16Array;
      case 32:
        return Int32Array;
      case 64: // No support for 64-bit integer values in JS
        return undefined;
    }
  }

  if (dtypeClass === DTypeClass.Unsigned) {
    switch (size) {
      case 8:
        return Uint8Array;
      case 16:
        return Uint16Array;
      case 32:
        return Uint32Array;
      case 64: // No support for 64-bit unsigned integer values in JS
        return undefined;
    }
  }

  if (dtypeClass === DTypeClass.Float) {
    switch (size) {
      case 16: // No support for 16-bit floating values in JS
        return undefined;
      case 32:
        return Float32Array;
      case 64:
        return Float64Array;
    }
  }

  return undefined;
}

export function convertH5GroveDtype(dtype: H5GroveDtype): DType {
  if (typeof dtype === 'string') {
    return convertDtypeString(dtype);
  }

  return {
    class: DTypeClass.Compound,
    fields: Object.fromEntries(
      Object.entries(dtype).map(([k, v]) => [k, convertH5GroveDtype(v)])
    ),
  };
}

function convertDtypeString(dtype: string): DType {
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
