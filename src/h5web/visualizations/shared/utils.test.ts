import { computeVisSize, findDomain } from './utils';

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

  describe('findDomain', () => {
    it('should return the domain of the data', () => {
      const data = [2, 0, 10, 5, 2, -1];
      const domain = findDomain(data);
      expect(domain).toEqual([-1, 10]);
    });

    it('should return undefined when the data is empty', () => {
      const domain = findDomain([]);
      expect(domain).toBeUndefined();
    });
  });
});
