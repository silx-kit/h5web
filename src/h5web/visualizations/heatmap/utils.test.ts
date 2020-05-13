import { interpolateRdBu } from 'd3-scale-chromatic';
import { generateCSSLinearGradient } from './utils';

describe('generateCSSLinearGradient', () => {
  it('should generate a linear gradient from first to last color', () => {
    // Escape parentheses for literal matching
    const firstColor = interpolateRdBu(0)
      .replace('(', '\\(')
      .replace(')', '\\)');
    const lastColor = interpolateRdBu(1)
      .replace('(', '\\(')
      .replace(')', '\\)');
    const regexp = RegExp(
      `linear-gradient\\(to top,${firstColor},.*${lastColor}\\)`
    );
    const result = generateCSSLinearGradient(interpolateRdBu, 'top');
    expect(result).toEqual(expect.stringMatching(regexp));
  });
});
