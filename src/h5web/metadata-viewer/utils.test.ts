import { renderShape } from './utils';

describe('renderShape', () => {
  it('should render scalar shape', () => {
    expect(renderShape([])).toBe('Scalar');
  });

  it('should render shape with one dimension', () => {
    expect(renderShape([5])).toBe('5');
  });

  it('should render shape with multiple dimensions', () => {
    expect(renderShape([10, 2, 6])).toBe('10 x 2 x 6 = 120');
  });

  it('should render null shape', () => {
    expect(renderShape(null)).toBe('None');
  });
});
