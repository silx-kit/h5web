import { EntityKind } from '@h5web/shared';

import type {
  JupyterDatasetResponse,
  JupyterGroupResponse,
  JupyterEntityResponse,
} from './models';

export function isGroupResponse(
  response: JupyterEntityResponse
): response is JupyterGroupResponse {
  return response.type === EntityKind.Group;
}

export function isDatasetResponse(
  response: JupyterEntityResponse
): response is JupyterDatasetResponse {
  return response.type === EntityKind.Dataset;
}
