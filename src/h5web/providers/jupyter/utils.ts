import Complex from 'complex.js';
import { assertArray } from '../../guards';
import { EntityKind, ComplexArray } from '../models';
import type {
  JupyterComplex,
  JupyterComplexValue,
  JupyterContentGroupResponse,
  JupyterContentResponse,
  JupyterMetaDatasetResponse,
  JupyterMetaGroupResponse,
  JupyterMetaResponse,
} from './models';

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

export function assertGroupContent(
  contents: JupyterContentResponse
): asserts contents is JupyterContentGroupResponse {
  assertArray(contents);
}

export function parseComplex(
  complex: JupyterComplex
): ComplexArray | [number, number] {
  if (isComplexValue(complex)) {
    // Remove eventual parenthesis
    const complexStr = complex.endsWith(')') ? complex.slice(1, -1) : complex;
    // Replace the Python `j` by the JS `i`
    const complexVal = new Complex(complexStr.replace('j', 'i'));
    return [complexVal.re, complexVal.im];
  }

  return complex.map((v) => parseComplex(v));
}

function isComplexValue(
  complex: JupyterComplex
): complex is JupyterComplexValue {
  return typeof complex === 'string';
}
