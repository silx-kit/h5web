import { tickStep } from 'd3-array';
import {
  computeVisSize,
  getDomain,
  extendDomain,
  getValueToIndexScale,
  getIntegerTicks,
} from './utils';
import { Domain, ScaleType } from './models';

describe('Shared visualization utilities', () => {
  describe('computeVisSize', () => {
    describe('with aspect ratio > 1', () => {
      it('should return available size with width reduced', () => {
        const availableSize = { width: 20, height: 10 };
        const size = computeVisSize(availableSize, 1.5);

        expect(size?.width).toBeLessThanOrEqual(availableSize.width);
        expect(size?.height).toBeLessThanOrEqual(availableSize.height);
        expect(size).toEqual({ width: 10 * 1.5, height: 10 });
      });

      it('should return available size with height reduced', () => {
        const availableSize = { width: 12, height: 50 };
        const size = computeVisSize(availableSize, 3);

        expect(size?.width).toBeLessThanOrEqual(availableSize.width);
        expect(size?.height).toBeLessThanOrEqual(availableSize.height);
        expect(size).toEqual({ width: 12, height: 12 / 3 });
      });
    });

    describe('with aspect ratio < 1', () => {
      it('should return available size with width reduced', () => {
        const availableSize = { width: 20, height: 10 };
        const size = computeVisSize(availableSize, 0.5);

        expect(size?.width).toBeLessThanOrEqual(availableSize.width);
        expect(size?.height).toBeLessThanOrEqual(availableSize.height);
        expect(size).toEqual({ width: 10 * 0.5, height: 10 });
      });

      it('should return available size with height reduced', () => {
        const availableSize = { width: 12, height: 50 };
        const size = computeVisSize(availableSize, 0.75);

        expect(size?.width).toBeLessThanOrEqual(availableSize.width);
        expect(size?.height).toBeLessThanOrEqual(availableSize.height);
        expect(size).toEqual({ width: 12, height: 12 / 0.75 });
      });
    });

    it('should return available size when no aspect ratio is provided', () => {
      const size = computeVisSize({ width: 20, height: 10 }, undefined);
      expect(size).toEqual({ width: 20, height: 10 });
    });

    it('should return `undefined` when no space is available for visualization', () => {
      const size = computeVisSize({ width: 0, height: 0 }, 1);
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

  describe('extendDomain', () => {
    it('should extend domain by factor', () => {
      const extendedDomain = extendDomain([0, 100], 0.5);
      expect(extendedDomain).toEqual([-50, 150]);
    });

    it('should return a non-empty domain when given an empty domain', () => {
      const extendedDomain = extendDomain([1, 1], 0.5);
      expect(extendedDomain).toEqual([0, 2]);
    });

    it('should extend domain by factor 1 with log scale', () => {
      // Extension factor of 1 for log scale means one decade
      const [extMin, extMax] = extendDomain([10, 100], 1, ScaleType.Log);
      expect(extMin).toBeCloseTo(1);
      expect(extMax).toBeCloseTo(1000);
    });

    it('should extend domain by factor with log scale', () => {
      const [min, max] = [1, 10];
      const [extMin, extMax] = extendDomain([min, max], 0.1, ScaleType.Log);
      expect(extMin).toBeLessThan(min);
      expect(extMax).toBeGreaterThan(max);
    });

    it('should extend domain for use with symlog scale', () => {
      const [min, max] = [-10, 0];
      const [extMin, extMax] = extendDomain([min, max], 0.1, ScaleType.SymLog);
      expect(extMin).toBeLessThan(min);
      expect(extMax).toBeGreaterThan(max);
    });

    it('should not extend domain when the factor is 0', () => {
      const [extMin, extMax] = extendDomain([10, 100], 0, ScaleType.Log);
      expect(extMin).toBe(10);
      expect(extMax).toBe(100);
    });

    it('should not extend domain outside of JS supported values', () => {
      const domain: Domain = [-1 / Number.EPSILON, 1 / Number.EPSILON];
      const extendedDomain = extendDomain(domain, 0.5);
      expect(domain).toEqual(extendedDomain);
    });

    it('should not extend domain outside of JS supported values with log scale', () => {
      const domain: Domain = [-Number.EPSILON, 1 / Number.EPSILON];
      const extendedDomain = extendDomain(domain, 0.75, ScaleType.Log);
      expect(domain).toEqual(extendedDomain);
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
});
