// @ts-nocheck
import cwise from 'cwise';
import type ndarray from 'ndarray';
import type { Domain } from './models';

export function findArrayDomain(data: ndarray): Domain | undefined {
  const findMinMax = cwise({
    args: ['index', 'array'],
    pre() {
      this.min = Infinity;
      this.max = -Infinity;
    },
    body(a) {
      if (a < this.min) {
        this.min = a;
      } else if (a > this.max) {
        this.max = a;
      }
    },
    post() {
      return Number.isFinite(this.min * this.max)
        ? [this.min, this.max]
        : undefined;
    },
  });
  return findMinMax(data);
}
