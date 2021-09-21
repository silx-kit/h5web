import { interpolateGreys } from 'd3-scale-chromatic';
import { getLinearGradient } from './utils';

const white = 'rgb(255, 255, 255)';
const black = 'rgb(0, 0, 0)';
const gradientRegex = /^linear-gradient\(to top, (.+)\)$/;

describe('getLinearGradient', () => {
  it('should generate linear gradient from first to last color', () => {
    const gradient = getLinearGradient(interpolateGreys, 'top');

    const [match, colorStops] = gradientRegex.exec(gradient) || [];
    expect(match).toBeDefined();
    expect(colorStops.startsWith(white)).toBe(true);
    expect(colorStops.endsWith(black)).toBe(true);
    expect(colorStops.match(/rgb/gu)?.length).toBe(21);
  });

  it('should generate linear gradient with two solid colors', () => {
    const gradient = getLinearGradient(interpolateGreys, 'top', true);

    const [match, colorStops] = gradientRegex.exec(gradient) || [];
    expect(match).toBeDefined();
    expect(colorStops).toEqual(
      `${white}, ${white} 50%, ${black} 50%, ${black}`
    );
  });
});
