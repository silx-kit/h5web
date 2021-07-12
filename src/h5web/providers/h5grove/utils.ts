import { EntityKind } from '../models';
import type {
  H5GroveEntityResponse,
  H5GroveDatasetReponse,
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
