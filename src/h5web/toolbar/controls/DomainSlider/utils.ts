import { Bound, BoundError } from '../../../vis-packs/core/models';

export function getBoundErrorProps(error: BoundError, bound: Bound) {
  switch (error) {
    case BoundError.InvalidWithLog:
      return {
        message: `Custom ${bound} invalid with log scale`,
        fallback: `data ${bound}`,
      };
    case BoundError.CustomMaxFallback:
      return {
        message: 'Custom min invalid with log scale',
        fallback: 'custom max',
      };
    default:
      throw new Error('Unknown domain error');
  }
}
