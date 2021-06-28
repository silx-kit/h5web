import { EntityKind } from '../models';
import type {
  H5GroveMetaResponse,
  H5GroveDatasetMetaReponse,
  H5GroveGroupMetaResponse,
} from './models';

export function isGroupResponse(
  response: H5GroveMetaResponse
): response is H5GroveGroupMetaResponse {
  return response.type === EntityKind.Group;
}
export function isDatasetResponse(
  response: H5GroveMetaResponse
): response is H5GroveDatasetMetaReponse {
  return response.type === EntityKind.Dataset;
}
