import { isNumber } from 'lodash';
import type { Axis } from './models';

export function isAxis(elem: number | Axis): elem is Axis {
  return !isNumber(elem);
}
