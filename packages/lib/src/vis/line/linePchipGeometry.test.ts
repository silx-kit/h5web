import 'three/addons/lines/LineMaterial.js'; // registers `ShaderLib.line`

import { ScaleType } from '@h5web/shared/vis-models';
import { ShaderLib, Vector2 } from 'three';
import { describe, expect, it } from 'vitest';

import { createScale } from '../utils';
import LinePchipGeometry, { pchipOnBeforeCompile } from './linePchipGeometry';

// Steps of 1 along x, alternating by 100 along y
const identity = createScale(ScaleType.Linear, {});
const geometry = new LinePchipGeometry({
  abscissas: Array.from({ length: 1000 }, (_, i) => i),
  ordinates: Array.from({ length: 1000 }, (_, i) => (i % 2) * 100),
  abscissaScale: identity,
  ordinateScale: identity,
});
geometry.update();

describe('LinePchipGeometry#setPixelsPerUnit', () => {
  it('should draw one segment per interval when intervals are a pixel wide, however tall', () => {
    expect(geometry.setPixelsPerUnit(new Vector2(1, 1))).toBe(1);
  });

  it('should draw more segments as intervals grow on screen, up to 16', () => {
    expect(geometry.setPixelsPerUnit(new Vector2(10, 1))).toBe(10);
    expect(geometry.setPixelsPerUnit(new Vector2(1000, 1))).toBe(16);
    expect(geometry.drawRange.count).toBe(16 * 18);
  });

  it('should subdivide wide intervals unless their height is within tolerance', () => {
    expect(geometry.setPixelsPerUnit(new Vector2(1000, 0.1))).toBe(16);
    expect(geometry.setPixelsPerUnit(new Vector2(1000, 0.01))).toBe(1);
  });
});

describe('pchipOnBeforeCompile', () => {
  it("should patch the installed version of three's `LineMaterial`", () => {
    const shader = {
      vertexShader: ShaderLib.line.vertexShader,
    };

    expect(() => pchipOnBeforeCompile(shader)).not.toThrow();
  });

  it('should throw when the code to patch is missing', () => {
    const shader = {
      vertexShader: 'void main() {}',
    };

    expect(() => pchipOnBeforeCompile(shader)).toThrow(/instanceStart/u);
  });
});
