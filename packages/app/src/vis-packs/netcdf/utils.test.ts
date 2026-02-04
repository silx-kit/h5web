import { floatType, intType } from '@h5web/shared/hdf5-utils';
import { describe, expect, it } from 'vitest';

import { createIgnoreFillValue } from './utils';

describe('createIgnoreFillValue', () => {
  describe('with integers', () => {
    it('should ignore values greater or equal to positive fill value', () => {
      const ignoreValue = createIgnoreFillValue(10, intType());
      expect(ignoreValue(9)).toBe(false);
      expect(ignoreValue(10)).toBe(true);
      expect(ignoreValue(11)).toBe(true);
    });

    it('should ignore values lower or equal to negative fill value', () => {
      const ignoreValue = createIgnoreFillValue(-10, intType());
      expect(ignoreValue(-9)).toBe(false);
      expect(ignoreValue(-10)).toBe(true);
      expect(ignoreValue(-11)).toBe(true);
    });
  });

  describe('with floats', () => {
    it('should ignore values greater than positive fill value', () => {
      const ignoreValue = createIgnoreFillValue(0.3, floatType(64));
      expect(ignoreValue(0.2)).toBe(false);
      expect(ignoreValue(0.3005)).toBe(true);
    });

    it('should ignore values close-enough to positive fill value', () => {
      const ignoreValue = createIgnoreFillValue(0.3, floatType(64));
      expect(ignoreValue(0.3 - 2 * Number.EPSILON)).toBe(false);
      expect(ignoreValue(0.3 - Number.EPSILON)).toBe(true);
      expect(ignoreValue(0.3)).toBe(true);
      expect(ignoreValue(0.3 + Number.EPSILON)).toBe(true);
      expect(ignoreValue(0.3 + 2 * Number.EPSILON)).toBe(true);
    });

    it('should ignore values lower than negative fill value', () => {
      const ignoreValue = createIgnoreFillValue(-0.3, floatType(64));
      expect(ignoreValue(-0.2)).toBe(false);
      expect(ignoreValue(-0.3005)).toBe(true);
    });

    it('should ignore values close-enough to negative fill value', () => {
      const ignoreValue = createIgnoreFillValue(-0.3, floatType(64));
      expect(ignoreValue(-0.3 + 2 * Number.EPSILON)).toBe(false);
      expect(ignoreValue(-0.3 + Number.EPSILON)).toBe(true);
      expect(ignoreValue(-0.3)).toBe(true);
      expect(ignoreValue(-0.3 - Number.EPSILON)).toBe(true);
      expect(ignoreValue(-0.3 - 2 * Number.EPSILON)).toBe(true);
    });
  });
});
