import type { Axis } from '@h5web/shared/vis-models';

export function isAxis(elem: number | Axis): elem is Axis {
  return typeof elem !== 'number';
}
