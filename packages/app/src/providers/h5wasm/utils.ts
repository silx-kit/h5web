import { EntityKind } from '@h5web/shared';

import type {
  H5WasmDatasetReponse,
  H5WasmEntityResponse,
  H5WasmExternalLinkResponse,
  H5WasmGroupResponse,
  H5WasmSoftLinkResponse,
} from './models';

export function isGroupResponse(
  response: H5WasmEntityResponse
): response is H5WasmGroupResponse {
  return response.type === EntityKind.Group;
}

export function isDatasetResponse(
  response: H5WasmEntityResponse
): response is H5WasmDatasetReponse {
  return response.type === EntityKind.Dataset;
}

export function isSoftLinkResponse(
  response: H5WasmEntityResponse
): response is H5WasmSoftLinkResponse {
  return response.type === 'soft_link';
}

export function isExternalLinkResponse(
  response: H5WasmEntityResponse
): response is H5WasmExternalLinkResponse {
  return response.type === 'external_link';
}
