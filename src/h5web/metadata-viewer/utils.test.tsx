import { renderShapeDims } from './utils';

describe('Metadata Viewer utilities', () => {
  describe('renderShapeDims', () => {
    it('should render shape with zero dimension', () => {
      expect(renderShapeDims([])).toBe('');
    });

    it('should render shape with one dimension', () => {
      expect(renderShapeDims([5])).toBe('5');
    });

    it('should render shape with multiple dimensions', () => {
      expect(renderShapeDims([10, 2, 6])).toBe('10 x 2 x 6 = 120');
    });
  });
});
