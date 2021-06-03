import { EntityKind } from '../models';
import type {
  H5CoreMetaResponse,
  H5CoreDatasetMetaReponse,
  H5CoreGroupMetaResponse,
} from './models';

export function isGroupResponse(
  response: H5CoreMetaResponse
): response is H5CoreGroupMetaResponse {
  return response.type === EntityKind.Group;
}
export function isDatasetResponse(
  response: H5CoreMetaResponse
): response is H5CoreDatasetMetaReponse {
  return response.type === EntityKind.Dataset;
}
