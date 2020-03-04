import { renderShapeDims } from './ShapeRenderer';

describe('renderShapeDims', () => {
  it('should render shapes with one dimension', () => {
    expect(renderShapeDims([5])).toBe('5');
  });

  it('should render shapes with multiple dimensions', () => {
    expect(renderShapeDims([10, 2, 6])).toBe('10 x 2 x 6 = 120');
  });
});
