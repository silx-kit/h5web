import { ScaleType } from '@h5web/shared/models-vis';
import { interpolateGreys } from 'd3-scale-chromatic';

import { DomainError } from '../models';
import { getLinearGradient, getSafeDomain } from './utils';

const white = 'rgb(255, 255, 255)';
const black = 'rgb(0, 0, 0)';
const gradientRegex = /^linear-gradient\(to top, (.+)\)$/;

describe('getSafeDomain', () => {
  it('should return given domain if safe in given scale', () => {
    const [domain, errors] = getSafeDomain([-10, 5], [1, 2], ScaleType.Linear);
    expect(domain).toEqual([-10, 5]);
    expect(errors).toEqual({});
  });

  it('should return fallback domain if min > max', () => {
    const [domain, errors] = getSafeDomain([5, -10], [1, 2], ScaleType.Linear);
    expect(domain).toEqual([1, 2]);
    expect(errors).toEqual({ minGreater: true });
  });

  it('should use fallback min if not supported by given scale', () => {
    const logResult = getSafeDomain([0, 5], [1, 2], ScaleType.Log);
    const sqrtResult = getSafeDomain([-1, 5], [1, 2], ScaleType.Sqrt);

    const expectedDomain = [1, 5];
    const expectedErrors = { minError: DomainError.InvalidMinWithScale };

    expect(logResult).toEqual([expectedDomain, expectedErrors]);
    expect(sqrtResult).toEqual([expectedDomain, expectedErrors]);
  });

  it('should return fallback domain if neither min nor max are supported by given scale', () => {
    const logResult = getSafeDomain([-2, 0], [1, 2], ScaleType.Log);
    const sqrtResult = getSafeDomain([-10, -5], [1, 2], ScaleType.Sqrt);

    const expectedDomain = [1, 2];
    const expectedErrors = {
      minError: DomainError.InvalidMinWithScale,
      maxError: DomainError.InvalidMaxWithScale,
    };

    expect(logResult).toEqual([expectedDomain, expectedErrors]);
    expect(sqrtResult).toEqual([expectedDomain, expectedErrors]);
  });

  it('should return empty [max, max] domain if fallback min is greater than max', () => {
    const [domain, errors] = getSafeDomain([-5, 5], [10, 20], ScaleType.Log);
    expect(domain).toEqual([5, 5]);
    expect(errors).toEqual({ minError: DomainError.CustomMaxFallback });
  });
});

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
    expect(colorStops).toBe(`${white}, ${white} 50%, ${black} 50%, ${black}`);
  });
});
