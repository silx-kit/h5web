import { describe, expect, it } from 'vitest';

import { renderDims } from './utils';

describe('renderDims', () => {
  it('should render zero dimension', () => {
    expect(renderDims([])).toBe('Scalar');
  });

  it('should render single dimension', () => {
    expect(renderDims([5])).toBe('5');
  });

  it('should render multiple dimensions', () => {
    expect(renderDims([10, 2, 6])).toBe('10 x 2 x 6 = 120');
  });
});
