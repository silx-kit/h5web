import type { DType } from '@h5web/shared';
import { DTypeClass, EntityKind, isNumericType } from '@h5web/shared';

import { ProviderError } from '../models';
import type {
  H5GroveDatasetReponse,
  H5GroveEntityResponse,
  H5GroveGroupResponse,
} from './models';

export function isGroupResponse(
  response: H5GroveEntityResponse
): response is H5GroveGroupResponse {
  return response.type === EntityKind.Group;
}

export function isDatasetResponse(
  response: H5GroveEntityResponse
): response is H5GroveDatasetReponse {
  return response.type === EntityKind.Dataset;
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

export function getMatchingProviderError(
  errorData: string
): ProviderError | undefined {
  if (errorData.includes('File not found')) {
    return ProviderError.FileNotFound;
  }
  if (errorData.includes('not a valid path')) {
    return ProviderError.EntityNotFound;
  }
  if (errorData.includes('Cannot resolve')) {
    return ProviderError.UnresolvableLink;
  }

  return undefined;
}
