import {
  Box3,
  type BufferAttribute,
  type BufferGeometry,
  type Camera,
  Float32BufferAttribute,
  InstancedInterleavedBuffer,
  InterleavedBufferAttribute,
  type Object3D,
  type Scene,
  Sphere,
  Vector2,
  Vector3,
  type WebGLRenderer,
} from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry as ThreeLineGeometry } from 'three/addons/lines/LineGeometry.js';

import { type H5WebGeometry } from '../models';
import { createBufferAttr, Z_OUT } from '../utils';
import { type LineGeometryParams } from './lineGeometry';
import { getPchipSlopes } from './utils';

const MAX_SEGMENTS_PER_INTERVAL = 16;
const MAX_ERROR_PX = 1; // in CSS pixels

/*
 * Stores `x, y, z, slope` once per data point, and lets the vertex shader
 * evaluate the cubic Hermite interpolant between consecutive points.
 * Each interval is one instance of a template of `MAX_SEGMENTS_PER_INTERVAL`
 * line segments, of which only as many as the current zoom needs are drawn.
 * Since `xyz` are the data points themselves, three's raycasting sees the
 * chords between points, and bounds are exact since PCHIP never leaves them.
 */
class LinePchipGeometry extends ThreeLineGeometry implements H5WebGeometry {
  private readonly length: number;
  private readonly points: BufferAttribute;
  private maxStepX = 0; // largest `|dx|` of any interval
  private maxStepY = 0; // largest `|dy|` of any interval

  public constructor(private readonly params: LineGeometryParams) {
    super();

    this.tileSegmentTemplate();

    this.length = params.ordinates.length;
    this.points = createBufferAttr(this.length, 4); // `x, y, z, slope` per point

    const { array } = this.points;
    const instancedBuffer = new InstancedInterleavedBuffer(array, 4);
    this.setAttribute(
      'instanceStart',
      new InterleavedBufferAttribute(instancedBuffer, 4, 0),
    );
    this.setAttribute(
      'instanceEnd',
      new InterleavedBufferAttribute(instancedBuffer, 4, 4),
    );
    this.instanceCount = Math.max(this.length - 1, 0);
  }

  public update(): void {
    const { abscissas, ordinates, abscissaScale, ordinateScale, ignoreValue } =
      this.params;

    // Plain loops: `Float64Array.from` with a callback is ~8× slower in V8
    const xs = new Float64Array(this.length);
    const ys = new Float64Array(this.length);
    for (let index = 0; index < this.length; index++) {
      const value = ordinates[index];
      xs[index] = abscissaScale(abscissas[index]);
      ys[index] = ignoreValue?.(value) ? Number.NaN : ordinateScale(value);
    }

    const slopes = getPchipSlopes(xs, ys);

    this.maxStepX = 0;
    this.maxStepY = 0;
    for (let index = 0; index < this.length; index++) {
      if (Number.isFinite(xs[index]) && Number.isFinite(ys[index])) {
        this.points.setXYZW(index, xs[index], ys[index], 0, slopes[index]);
      } else {
        this.points.setXYZW(index, 0, 0, Z_OUT, 0);
      }

      const dx = Math.abs(xs[index + 1] - xs[index]);
      const dy = Math.abs(ys[index + 1] - ys[index]);
      if (Number.isFinite(dx) && Number.isFinite(dy)) {
        this.maxStepX = Math.max(this.maxStepX, dx);
        this.maxStepY = Math.max(this.maxStepY, dy);
      }
    }
  }

  // Caps the segments drawn per interval: no interval needs more than this
  public setPixelsPerUnit(pixelsPerUnit: Vector2): number {
    const segments = getSegmentCount(
      this.maxStepX * pixelsPerUnit.x,
      this.maxStepY * pixelsPerUnit.y,
    );
    this.setDrawRange(0, segments * TEMPLATE_INDEX_COUNT);
    return segments;
  }

  // three's versions read `instanceEnd` of the last point past the end of the buffer
  public override computeBoundingBox(): void {
    this.boundingBox = new Box3().setFromBufferAttribute(this.points);
  }

  public override computeBoundingSphere(): void {
    const box = new Box3().setFromBufferAttribute(this.points);
    this.boundingSphere = box.getBoundingSphere(new Sphere());
  }

  // Repeats three's single-segment template, numbering the copies with `segment`
  private tileSegmentTemplate(): void {
    const { position, uv } = this.attributes;
    const index = this.getIndex();
    if (!index) {
      return;
    }

    const copies = Array.from(
      { length: MAX_SEGMENTS_PER_INTERVAL },
      (_, k) => k,
    );
    function tile(values: ArrayLike<number>, offset = 0): number[] {
      return copies.flatMap((k) => Array.from(values, (v) => v + k * offset));
    }

    this.setIndex(tile(index.array, position.count));
    this.setAttribute(
      'position',
      new Float32BufferAttribute(tile(position.array), 3),
    );
    this.setAttribute('uv', new Float32BufferAttribute(tile(uv.array), 2));
    this.setAttribute(
      'segment',
      new Float32BufferAttribute(
        tile(
          Array.from({ length: position.count }, () => 0),
          1,
        ),
        1,
      ),
    );
  }
}

/*
 * PCHIP is monotone on every interval, so each of `n` chords is the diagonal of
 * a box containing its piece of curve: the error is at most `min(width / n, height)`.
 * Mirrored by `segmentsForInterval` in the shader.
 */
function getSegmentCount(widthPx: number, heightPx: number): number {
  if (heightPx <= MAX_ERROR_PX) {
    return 1;
  }
  const segments = Math.ceil(widthPx / MAX_ERROR_PX);
  return Math.min(Math.max(segments, 1), MAX_SEGMENTS_PER_INTERVAL);
}

const TEMPLATE_INDEX_COUNT = 18; // indices of three's single-segment template

// Patches three's `LineMaterial` to draw the segments of `LinePchipGeometry`
export function pchipOnBeforeCompile(shader: { vertexShader: string }): void {
  let source = shader.vertexShader;
  source = replaceOrThrow(
    source,
    /attribute vec3 instanceStart;\s*attribute vec3 instanceEnd;/u,
    /* glsl */ `
        attribute vec4 instanceStart; // x, y, z, slope at start of interval
        attribute vec4 instanceEnd; // x, y, z, slope at end of interval
        attribute float segment; // index of segment within interval
        uniform float maxSegments; // segments drawn per interval, set by \`setPixelsPerUnit\`

        vec2 toPixels(vec4 point) {
          vec4 clip = projectionMatrix * modelViewMatrix * vec4(point.xyz, 1.0);
          return 0.5 * resolution * clip.xy / clip.w;
        }

        // Same rule as \`getSegmentCount\`, for this interval alone
        float segmentsForInterval() {
          vec2 size = abs(toPixels(instanceEnd) - toPixels(instanceStart));
          if (size.y <= float(${MAX_ERROR_PX})) {
            return 1.0;
          }
          return clamp(ceil(size.x / float(${MAX_ERROR_PX})), 1.0, maxSegments);
        }

        // Cubic Hermite interpolant at fraction \`offset\` of current segment
        vec3 pchipPoint(float offset) {
          float segments = segmentsForInterval();
          float t = (segment + offset) / segments;
          float width = instanceEnd.x - instanceStart.x;
          float rise = instanceEnd.y - instanceStart.y;
          float m0 = instanceStart.w * width;
          float m1 = instanceEnd.w * width;
          float y = instanceStart.y + t * (m0 + t * (3.0 * rise - 2.0 * m0 - m1 + t * (m0 + m1 - 2.0 * rise)));

          // Segments this interval doesn't need are moved out of view, like invalid points
          float z = segment < segments ? min(instanceStart.z, instanceEnd.z) : float(${Z_OUT});
          return vec3(instanceStart.x + t * width, y, z);
        }
      `,
  );
  source = replaceOrThrow(
    source,
    'vec4( instanceStart, 1.0 )',
    'vec4( pchipPoint( 0.0 ), 1.0 )',
  );
  source = replaceOrThrow(
    source,
    'vec4( instanceEnd, 1.0 )',
    'vec4( pchipPoint( 1.0 ), 1.0 )',
  );

  // eslint-disable-next-line no-param-reassign -- `onBeforeCompile` works by mutation
  shader.vertexShader = source;
}

// Fails loudly if a three upgrade changes the `LineMaterial` code being patched
function replaceOrThrow(
  source: string,
  pattern: string | RegExp,
  replacement: string,
): string {
  const result = source.replace(pattern, replacement);
  if (result === source) {
    throw new Error(
      `Expected LineMaterial vertex shader to contain ${pattern}`,
    );
  }
  return result;
}

// Picks the number of segments per interval for the current zoom level
export function pchipOnBeforeRender(
  renderer: WebGLRenderer,
  _scene: Scene,
  camera: Camera,
  geometry: BufferGeometry,
  line: Object3D,
): void {
  if (!(geometry instanceof LinePchipGeometry && line instanceof Line2)) {
    return;
  }

  const { width, height } = renderer.getSize(new Vector2()); // CSS pixels, like `LineMaterial`'s `resolution`;
  const origin = new Vector3(0, 0, 0).project(camera);
  const unit = new Vector3(1, 1, 0).project(camera).sub(origin);
  const pixelsPerUnit = new Vector2(
    Math.abs((unit.x * width) / 2),
    Math.abs((unit.y * height) / 2),
  );

  // Also runs before first compile, so that three knows to upload it
  // eslint-disable-next-line no-param-reassign -- uniforms are set by mutation
  line.material.uniforms.maxSegments = {
    value: geometry.setPixelsPerUnit(pixelsPerUnit),
  };
}

export default LinePchipGeometry;
