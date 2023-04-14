import { type Axis } from '@h5web/shared';
import { isNumber } from 'lodash';

export function isAxis(elem: number | Axis): elem is Axis {
  return !isNumber(elem);
}
