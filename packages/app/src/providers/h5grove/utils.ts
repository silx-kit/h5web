import type { DType } from '@h5web/shared/hdf5-models';
import { Endianness, EntityKind } from '@h5web/shared/hdf5-models';
import {
  boolType,
  compoundType,
  cplxType,
  floatType,
  intType,
  strType,
  uintType,
  unknownType,
} from '@h5web/shared/hdf5-utils';

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

  return compoundType(
    Object.fromEntries(
      Object.entries(dtype).map(([k, v]) => [k, convertH5GroveDtype(v)]),
    ),
  );
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
      return boolType();

    case 'f':
      return floatType(length * 8, endianness);

    case 'i':
      return intType(length * 8, endianness);

    case 'u':
      return uintType(length * 8, endianness);

    case 'c':
      return cplxType(
        floatType(
          (length / 2) * 8, // bytes are equally distributed between real and imag
          endianness,
        ),
      );

    case 'S':
      return strType('ASCII', length);

    case 'O':
      return strType('UTF-8');

    default:
      return unknownType();
  }
}

export function hasErrorMessage(error: unknown): error is { message: string } {
  return !!error && typeof error === 'object' && 'message' in error;
}
