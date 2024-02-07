import type { Axis } from '@h5web/shared/vis-models';
import { isNumber } from 'lodash-es';

export function isAxis(elem: number | Axis): elem is Axis {
  return !isNumber(elem);
}
