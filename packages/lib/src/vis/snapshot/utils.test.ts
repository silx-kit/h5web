import { describe, expect, it } from 'vitest';

import {
  combineFilters,
  getColorAlpha,
  getSafeScale,
  getSnapshotFilename,
  MAX_CANVAS_AREA,
  MAX_CANVAS_SIDE,
  parseLinearGradient,
  splitTopLevel,
} from './utils';

describe('splitTopLevel', () => {
  it('should ignore separators inside parentheses', () => {
    expect(splitTopLevel('to top, rgb(1, 2, 3) 0%, red 100%')).toEqual([
      'to top',
      'rgb(1, 2, 3) 0%',
      'red 100%',
    ]);
    expect(splitTopLevel('rgb(1, 2, 3) 50%', ' ')).toEqual([
      'rgb(1, 2, 3)',
      '50%',
    ]);
  });
});

describe('parseLinearGradient', () => {
  it('should parse colour bar gradient with implicit positions', () => {
    expect(
      parseLinearGradient(
        'linear-gradient(to top, rgb(68, 1, 84), rgb(33, 145, 140), rgb(253, 231, 37))',
      ),
    ).toEqual({
      direction: 'top',
      stops: [
        { color: 'rgb(68, 1, 84)', offset: 0 },
        { color: 'rgb(33, 145, 140)', offset: 0.5 },
        { color: 'rgb(253, 231, 37)', offset: 1 },
      ],
    });
  });

  it('should parse explicit positions (min/max-only gradient)', () => {
    expect(
      parseLinearGradient(
        'linear-gradient(to right, red, red 50%, blue 50%, blue)',
      )?.stops.map((s) => s.offset),
    ).toEqual([0, 0.5, 0.5, 1]);
  });

  it('should return undefined for unsupported values', () => {
    expect(parseLinearGradient('none')).toBeUndefined();
    expect(
      parseLinearGradient('linear-gradient(45deg, red, blue)'),
    ).toBeUndefined();
    expect(parseLinearGradient('linear-gradient(to top, red)')).toBeUndefined();
  });
});

describe('combineFilters', () => {
  it('should cancel out double inversion (dark mode with kept colours)', () => {
    expect(combineFilters(['invert(1)', 'none', 'invert(1)'])).toBe('none');
    expect(combineFilters(['none', 'invert(1)', 'none'])).toBe('invert(1)');
    expect(combineFilters(['none'])).toBe('none');
  });

  it('should keep other filters in order', () => {
    expect(combineFilters(['blur(2px)', 'invert(1) hue-rotate(90deg)'])).toBe(
      'blur(2px) invert(1) hue-rotate(90deg)',
    );
  });
});

describe('getColorAlpha', () => {
  it('should parse alpha of computed colours', () => {
    expect(getColorAlpha('rgb(255, 0, 0)')).toBe(1);
    expect(getColorAlpha('rgba(255, 0, 0, 0.5)')).toBe(0.5);
    expect(getColorAlpha('rgb(255 0 0 / 25%)')).toBe(0.25);
    expect(getColorAlpha('rgba(0, 0, 0, 0)')).toBe(0);
    expect(getColorAlpha('transparent')).toBe(0);
    expect(getColorAlpha('color(srgb 1 0 0)')).toBe(1);
  });
});

describe('getSafeScale', () => {
  it('should keep requested scale when within limits', () => {
    expect(getSafeScale(1000, 800, 4)).toBe(4);
  });

  it('should reduce scale to stay within canvas limits', () => {
    const scale = getSafeScale(3000, 2500, 4);
    expect(3000 * scale * 2500 * scale).toBeLessThanOrEqual(
      MAX_CANVAS_AREA + 1,
    );
    expect(scale).toBeLessThan(4);

    expect(getSafeScale(10_000, 10, 4) * 10_000).toBeLessThanOrEqual(
      MAX_CANVAS_SIDE,
    );
  });
});

describe('getSnapshotFilename', () => {
  it('should derive safe file name from title', () => {
    expect(getSnapshotFilename('NeXus 2D')).toBe('NeXus_2D.png');
    expect(getSnapshotFilename('a/b: c?')).toBe('ab_c.png');
    expect(getSnapshotFilename('Énergie (µm) 測定')).toBe(
      'Énergie_µm_測定.png',
    );
    expect(getSnapshotFilename('..hidden')).toBe('hidden.png');
    expect(getSnapshotFilename('')).toBe('snapshot.png');
    expect(getSnapshotFilename(undefined)).toBe('snapshot.png');
  });
});
