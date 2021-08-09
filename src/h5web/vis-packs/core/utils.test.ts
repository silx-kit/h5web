import { tickStep } from 'd3-array';
import {
  computeCanvasSize,
  getDomain,
  getDomains,
  extendDomain,
  getValueToIndexScale,
  getIntegerTicks,
  getCombinedDomain,
  clampBound,
} from './utils';
import { Domain, ScaleType } from './models';

const MAX = Number.MAX_VALUE / 2;
const POS_MIN = Number.MIN_VALUE;
const { NaN: NAN, POSITIVE_INFINITY: INFINITY } = Number;

describe('computeCanvasSize', () => {
  describe('with aspect ratio > 1', () => {
    it('should return available size with width reduced', () => {
      const availableSize = { width: 20, height: 10 };
      const size = computeCanvasSize(availableSize, 1.5);

      expect(size?.width).toBeLessThanOrEqual(availableSize.width);
      expect(size?.height).toBeLessThanOrEqual(availableSize.height);
      expect(size).toEqual({ width: 10 * 1.5, height: 10 });
    });

    it('should return available size with height reduced', () => {
      const availableSize = { width: 12, height: 50 };
      const size = computeCanvasSize(availableSize, 3);

      expect(size?.width).toBeLessThanOrEqual(availableSize.width);
      expect(size?.height).toBeLessThanOrEqual(availableSize.height);
      expect(size).toEqual({ width: 12, height: 12 / 3 });
    });
  });

  describe('with aspect ratio < 1', () => {
    it('should return available size with width reduced', () => {
      const availableSize = { width: 20, height: 10 };
      const size = computeCanvasSize(availableSize, 0.5);

      expect(size?.width).toBeLessThanOrEqual(availableSize.width);
      expect(size?.height).toBeLessThanOrEqual(availableSize.height);
      expect(size).toEqual({ width: 10 * 0.5, height: 10 });
    });

    it('should return available size with height reduced', () => {
      const availableSize = { width: 12, height: 50 };
      const size = computeCanvasSize(availableSize, 0.75);

      expect(size?.width).toBeLessThanOrEqual(availableSize.width);
      expect(size?.height).toBeLessThanOrEqual(availableSize.height);
      expect(size).toEqual({ width: 12, height: 12 / 0.75 });
    });
  });

  it('should return available size when no aspect ratio is provided', () => {
    const size = computeCanvasSize({ width: 20, height: 10 }, undefined);
    expect(size).toEqual({ width: 20, height: 10 });
  });

  it('should return `undefined` when no space is available for visualization', () => {
    const size = computeCanvasSize({ width: 0, height: 0 }, 1);
    expect(size).toBeUndefined();
  });
});

describe('getDomain', () => {
  it('should return min and max values of data array', () => {
    const data = [2, 0, 10, 5, 2, -1];
    const domain = getDomain(data);
    expect(domain).toEqual([-1, 10]);
  });

  it('should return `undefined` if data is empty', () => {
    const domain = getDomain([]);
    expect(domain).toBeUndefined();
  });

  it('should ignore NaN and Infinity', () => {
    const domain = getDomain([2, NAN, 10, INFINITY, 2, -1]);
    expect(domain).toEqual([-1, 10]);
  });

  it('should return `undefined` if data contains only NaN and Infinity', () => {
    const domain = getDomain([NAN, NAN, -INFINITY, INFINITY]);
    expect(domain).toBeUndefined();
  });

  describe('with log scale', () => {
    it('should support negative domain', () => {
      const domain = getDomain([-2, -10, -5, -2, -1], ScaleType.Log);
      expect(domain).toEqual([-10, -1]);
    });

    it('should clamp domain min to first positive value when domain crosses zero', () => {
      const domain = getDomain([2, 0, 10, 5, 2, -1], ScaleType.Log);
      expect(domain).toEqual([2, 10]);
    });

    it('should return `undefined` if domain is not supported', () => {
      const domain = getDomain([-2, 0, -10, -5, -2, -1], ScaleType.Log);
      expect(domain).toBeUndefined();
    });
  });
});

describe('getDomains', () => {
  it('should return domains of multiple arrays', () => {
    const arr1 = [2, 0, 10, 5, 2, -1];
    const arr2: number[] = [];
    const arr3 = [100];

    const domain = getDomains([arr1, arr2, arr3]);
    expect(domain).toEqual([[-1, 10], undefined, [100, 100]]);
  });

  it('should return domains of multiple arrays in log scale', () => {
    const arr1 = [-2, -10, -5, -2, -1];
    const arr2 = [2, 0, 10, 5, 2, -1];
    const arr3 = [-2, 0, -10, -5, -2, -1];

    const domain = getDomains([arr1, arr2, arr3], ScaleType.Log);
    expect(domain).toEqual([[-10, -1], [2, 10], undefined]);
  });
});

describe('clampBound', () => {
  it('should clamp to `Number.MAX_VALUE / 2` and keep sign', () => {
    expect(clampBound(Infinity)).toEqual(MAX);
    expect(clampBound(-Infinity)).toEqual(-MAX);
    expect(clampBound(MAX)).toEqual(MAX);
    expect(clampBound(-MAX)).toEqual(-MAX);
    expect(clampBound(MAX - 1)).toEqual(MAX - 1);
    expect(clampBound(-MAX + 1)).toEqual(-MAX + 1);
  });
});

describe('extendDomain', () => {
  it('should extend domain with linear scale', () => {
    const extendedDomain = extendDomain([0, 100], 0.5);
    expect(extendedDomain).toEqual([-50, 150]);
  });

  it('should extend domain with symlog scale', () => {
    const [min, max] = [-10, 0];
    const [extMin, extMax] = extendDomain([min, max], 0.1, ScaleType.SymLog);
    expect(extMin).toBeLessThan(min);
    expect(extMax).toBeGreaterThan(max);
  });

  it('should extend domain with log scale', () => {
    const [min, max] = [1, 10];
    const [extMin1, extMax1] = extendDomain([min, max], 0.1, ScaleType.Log);
    expect(extMin1).toBeLessThan(min);
    expect(extMax1).toBeGreaterThan(max);

    // Extension factor of 1 for log scale means one decade
    const [extMin2, extMax2] = extendDomain([10, 100], 1, ScaleType.Log);
    expect(extMin2).toBeCloseTo(1);
    expect(extMax2).toBeCloseTo(1000);
  });

  it('should extend domain with sqrt scale', () => {
    const [min, max] = [1, 10];
    const [extMin1, extMax1] = extendDomain([min, max], 0.1, ScaleType.Sqrt);
    expect(extMin1).toBeLessThan(min);
    expect(extMax1).toBeGreaterThan(max);
  });

  it('should extend positive single-value domain', () => {
    expect(extendDomain([2, 2], 0.5)).toEqual([1, 3]);
    expect(extendDomain([1, 1], 1)).toEqual([0, 2]);
    expect(extendDomain([1, 1], 1, ScaleType.Log)).toEqual([0.1, 10]);
  });

  it('should extend negative single-value domain', () => {
    expect(extendDomain([-1, -1], 0.5)).toEqual([-1.5, -0.5]);
    expect(extendDomain([-2, -2], 1, ScaleType.SymLog)).toEqual([-4, 0]);
  });

  it('should return [-1, 1] regardless of factor when trying to extend [0, 0]', () => {
    expect(extendDomain([0, 0], 0.5)).toEqual([-1, 1]);
    expect(extendDomain([0, 0], 1, ScaleType.SymLog)).toEqual([-1, 1]);
  });

  it('should return [0, 1] when trying to extend [0, 0] for sqrt scale', () => {
    expect(extendDomain([0, 0], 1, ScaleType.Sqrt)).toEqual([0, 1]);
  });

  it('should not extend domain when factor is 0', () => {
    const extendedDomain = extendDomain([10, 100], 0, ScaleType.Log);
    expect(extendedDomain).toEqual([10, 100]);
  });

  it('should not extend domain outside of supported values with log scale', () => {
    const domain: Domain = [POS_MIN * 2, 100];
    const [extMin1, extMax1] = extendDomain(domain, 0.75, ScaleType.Log);
    expect(extMin1).toEqual(POS_MIN);
    expect(extMax1).toBeGreaterThan(100);
  });

  it('should throw if domain is not compatible with log scale', () => {
    const errRegex = /compatible with log scale/;
    expect(() => extendDomain([-1, 1], 0.5, ScaleType.Log)).toThrow(errRegex);
    expect(() => extendDomain([0, 1], 0.5, ScaleType.Log)).toThrow(errRegex);
    expect(() => extendDomain([0, 0], 0.5, ScaleType.Log)).toThrow(errRegex);
  });

  it('should not extend domain outside of supported values with sqrt scale', () => {
    const domain: Domain = [POS_MIN, 100];
    const [extMin1, extMax1] = extendDomain(domain, 0.75, ScaleType.Sqrt);
    expect(extMin1).toEqual(0);
    expect(extMax1).toBeGreaterThan(100);
  });

  it('should throw if domain is not compatible with sqrt scale', () => {
    expect(() => extendDomain([-1, 1], 0.5, ScaleType.Sqrt)).toThrow(
      /compatible with sqrt scale/
    );
  });
});

describe('getValueToIndexScale', () => {
  it('should create threshold scale from values to indices', () => {
    const scale = getValueToIndexScale([10, 20, 30]);

    expect(scale(0)).toEqual(0);
    expect(scale(10)).toEqual(0);
    expect(scale(19.9)).toEqual(0);
    expect(scale(20)).toEqual(1);
    expect(scale(100)).toEqual(2);
  });

  it('should allow scale to switch at midpoints', () => {
    const scale = getValueToIndexScale([10, 20, 30], true);

    expect(scale(0)).toEqual(0);
    expect(scale(14.9)).toEqual(0);
    expect(scale(15)).toEqual(1);
    expect(scale(24.9)).toEqual(1);
    expect(scale(25)).toEqual(2);
    expect(scale(100)).toEqual(2);
  });
});

describe('getIntegerTicks', () => {
  it('should return zero tick values when visible domain spans zero indices', () => {
    const prop1 = getIntegerTicks([0.2, 0.8], 3);
    expect(prop1).toEqual([]);

    const prop2 = getIntegerTicks([5.01, 5.02], 3);
    expect(prop2).toEqual([]);
  });

  it('should return as many integer tick values as indices when space allows for it', () => {
    const prop1 = getIntegerTicks([0, 3], 10);
    expect(prop1).toEqual([0, 1, 2, 3]);

    const prop2 = getIntegerTicks([5.4, 6.9], 10);
    expect(prop2).toEqual([6]);
  });

  it('should return evenly-spaced tick values for available space', () => {
    const prop1 = getIntegerTicks([0.8, 20.2], 10); // domain has 20 potential ticks but space allows for 10
    expect(prop1).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);

    const prop2 = getIntegerTicks([2, 7], 3); // domain has 8 potential ticks but space allows for 3
    expect(prop2).toEqual([2, 4, 6]);
  });

  it('should always return integer tick values', () => {
    // Tick count is not always respected, which is acceptable
    const prop1 = getIntegerTicks([0, 4], 3); // domain has 5 potential ticks but space allows for 3
    expect(prop1).toEqual([0, 1, 2, 3, 4]);

    // This is because `d3.tickStep` is not too worried about the count...
    expect(tickStep(0, 4, 3)).toBe(1); // step should actually be 2 to end up with 3 ticks: `[0, 2, 4]`

    // Unfortunately, this behaviour can lead to decimal tick values (i.e. step < 1)...
    expect(tickStep(0, 2, 3)).toBe(0.5); // we'd end up with `[0, 0.5, 1, 1.5, 2]` instead of `[0, 1, 2]`

    // So we specifically work around it by forcing the step to be greater than or equal to 1
    const prop2 = getIntegerTicks([0, 2], 3);
    expect(prop2).toEqual([0, 1, 2]);
  });
});

describe('getCombinedDomain', () => {
  it('should return the minimum of minima and the maximum of maxima', () => {
    const combinedDomain = getCombinedDomain([
      [0, 1],
      [-1, 0.5],
      [-0.2, 10],
    ]);

    expect(combinedDomain).toEqual([-1, 10]);
  });

  it('should return undefined when there is no domain to combine', () => {
    const combinedDomain = getCombinedDomain([]);
    expect(combinedDomain).toBeUndefined();
  });

  it('should ignore undefined domains', () => {
    const combinedDomain1 = getCombinedDomain([[-5, 8], undefined, undefined]);
    expect(combinedDomain1).toEqual([-5, 8]);

    const combinedDomain2 = getCombinedDomain([undefined, [0, 1], undefined]);
    expect(combinedDomain2).toEqual([0, 1]);
  });

  it('should return undefined when all domains are undefined', () => {
    const combinedDomain = getCombinedDomain([undefined, undefined]);
    expect(combinedDomain).toBeUndefined();
  });
});
