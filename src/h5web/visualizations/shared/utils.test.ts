import { computeVisSize } from './utils';

describe('Shared visualization utilities', () => {
  describe('computeVisSize', () => {
    it('should return available size with width adjusted based on aspect ratio', () => {
      const size = computeVisSize({ width: 20, height: 10 }, 1.5);
      expect(size).toEqual({ width: 15, height: 10 });
    });

    it('should return available size with height adjusted based on aspect ratio', () => {
      const size = computeVisSize({ width: 20, height: 10 }, 3);
      expect(size).toEqual({ width: 20, height: 60 });
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
});
