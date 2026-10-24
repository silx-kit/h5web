import { assertNonNull } from '@h5web/shared/guards';
import { ScaleType } from '@h5web/shared/vis-models';
import ndarray from 'ndarray';
import { describe, expect, it } from 'vitest';

import SurfaceMeshGeometry from './surfaceMeshGeometry';
import { getLinearColorLut } from './utils';

function buildGeometry(
  params: ConstructorParameters<typeof SurfaceMeshGeometry>[0],
) {
  const geometry = new SurfaceMeshGeometry(params);
  geometry.update();
  assertNonNull(geometry.index);

  const { position, color } = geometry.attributes;
  const index = geometry.index.array.slice(0, geometry.drawRange.count);
  return { geometry, positions: position.array, index, colors: color.array };
}

describe('SurfaceMeshGeometry', () => {
  it('should normalize heights with scale and create two triangles per cell', () => {
    const values = ndarray([0, 5, 10, 10], [2, 2]);
    const { positions, index } = buildGeometry({
      values,
      xCoords: [-0.5, 0.5],
      yCoords: [-0.25, 0.25],
      domain: [0, 10],
      scaleType: ScaleType.Linear,
    });

    expect([...positions]).toEqual([
      -0.5, -0.25, 0, 0.5, -0.25, 0.5, -0.5, 0.25, 1, 0.5, 0.25, 1,
    ]);
    expect([...index]).toEqual([0, 1, 2, 1, 3, 2]);
  });

  it('should clamp heights to domain', () => {
    const values = ndarray([-5, 20, 0, 0], [2, 2]);
    const { positions } = buildGeometry({
      values,
      xCoords: [0, 1],
      yCoords: [0, 1],
      domain: [0, 10],
      scaleType: ScaleType.Linear,
    });

    expect(positions[2]).toBe(0);
    expect(positions[5]).toBe(1);
  });

  it('should use same scale for height as for colours (log)', () => {
    const values = ndarray([1, 10, 100, 1000], [2, 2]);
    const { positions } = buildGeometry({
      values,
      xCoords: [0, 1],
      yCoords: [0, 1],
      domain: [1, 1000],
      scaleType: ScaleType.Log,
    });

    const heights = [positions[2], positions[5], positions[8], positions[11]];
    expect(heights[0]).toBe(0);
    expect(heights[1]).toBeCloseTo(1 / 3);
    expect(heights[2]).toBeCloseTo(2 / 3);
    expect(heights[3]).toBeCloseTo(1);
  });

  it('should leave holes for NaN, ignored and unsupported values', () => {
    // 3x3 grid -> 4 cells; each corner cell has a bad value
    const values = ndarray([1, 2, Number.NaN, 4, 5, 6, -7, 8, 99], [3, 3]);
    const { index } = buildGeometry({
      values,
      xCoords: [0, 1, 2],
      yCoords: [0, 1, 2],
      domain: [1, 10],
      scaleType: ScaleType.Log, // -7 not supported
      ignoreValue: (val) => val === 99,
    });

    // Only bottom-left cell (values 1, 2, 4, 5) remains
    expect([...index]).toEqual([0, 1, 3, 1, 4, 3]);
  });

  it('should leave holes for non-finite axis coordinates', () => {
    const { positions, index } = buildGeometry({
      values: ndarray([1, 2, 3, 4, 5, 6], [2, 3]),
      xCoords: [0, Number.NaN, 2],
      yCoords: [0, 1],
      domain: [1, 6],
      scaleType: ScaleType.Linear,
    });

    expect(index).toHaveLength(0); // both cells touch column with NaN coordinate
    expect(positions.every(Number.isFinite)).toBe(true);
  });

  it('should produce no triangle with a single row or column', () => {
    const { index } = buildGeometry({
      values: ndarray([1, 2, 3], [1, 3]),
      xCoords: [0, 1, 2],
      yCoords: [0],
      domain: [1, 3],
      scaleType: ScaleType.Linear,
    });

    expect(index).toHaveLength(0);
  });

  it('should map normalized heights through colour map', () => {
    const colorLut = getLinearColorLut('Greys', false);
    const { geometry, colors } = buildGeometry({
      values: ndarray([0, 10, 0, 10], [2, 2]),
      xCoords: [0, 1],
      yCoords: [0, 1],
      domain: [0, 10],
      scaleType: ScaleType.Linear,
    });

    geometry.updateColors(colorLut);

    // Min value gets first colour of LUT, max value gets last colour
    expect(colors.slice(0, 3)).toEqual(colorLut.slice(0, 3));
    expect(colors.slice(3, 6)).toEqual(colorLut.slice(-3));
    expect(colorLut[0]).not.toBe(colorLut.at(-1));
  });
});
