import Complex from 'complex.js';
import { assertArray } from '../../guards';
import {
  EntityKind,
  ComplexArray,
  Endianness,
  DType,
  DTypeClass,
} from '../models';
import type {
  JupyterComplex,
  JupyterComplexValue,
  JupyterContentGroupResponse,
  JupyterContentResponse,
  JupyterMetaDatasetResponse,
  JupyterMetaGroupResponse,
  JupyterMetaResponse,
} from './models';

// https://numpy.org/doc/stable/reference/generated/numpy.dtype.byteorder.html#numpy.dtype.byteorder
const ENDIANNESS_MAPPING: Record<string, Endianness> = {
  '<': Endianness.LE,
  '>': Endianness.BE,
};

export function isGroupResponse(
  response: JupyterMetaResponse
): response is JupyterMetaGroupResponse {
  return response.type === EntityKind.Group;
}
export function isDatasetResponse(
  response: JupyterMetaResponse
): response is JupyterMetaDatasetResponse {
  return response.type === EntityKind.Dataset;
}

export function assertGroupResponse(
  response: JupyterMetaResponse
): asserts response is JupyterMetaGroupResponse {
  if (!isGroupResponse(response)) {
    throw new Error('Expected group response');
  }
}

export function assertGroupContent(
  contents: JupyterContentResponse
): asserts contents is JupyterContentGroupResponse {
  assertArray(contents);
}

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

export function parseComplex(complex: JupyterComplex): ComplexArray | Complex {
  if (isComplexValue(complex)) {
    // Remove eventual parenthesis
    const complexStr = complex.endsWith(')') ? complex.slice(1, -1) : complex;
    // Replace the Python `j` by the JS `i`
    return new Complex(complexStr.replace('j', 'i'));
  }

  return complex.map((v) => parseComplex(v));
}

function isComplexValue(
  complex: JupyterComplex
): complex is JupyterComplexValue {
  return typeof complex === 'string';
}
