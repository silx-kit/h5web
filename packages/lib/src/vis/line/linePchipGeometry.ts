import { type NumArray } from '@h5web/shared/vis-models';
import {
  type BufferAttribute,
  InstancedInterleavedBuffer,
  InterleavedBufferAttribute,
} from 'three';
import { LineGeometry as ThreeLineGeometry } from 'three/addons/lines/LineGeometry.js';

import { type H5WebGeometry } from '../models';
import { createBufferAttr, Z_OUT } from '../utils';
import { type LineGeometryParams } from './lineGeometry';
import { evalHermite, getPchipSlopes } from './pchipUtils';

const SEGMENTS_PER_PIXEL = 4;

class LinePchipGeometry extends ThreeLineGeometry implements H5WebGeometry {
  private readonly xs: Float64Array;
  private readonly ys: Float64Array;
  private readonly slopes: Float64Array;
  private readonly segmentCountsPerInterval: Uint32Array;
  private readonly positions: BufferAttribute;

  public constructor(params: LineGeometryParams) {
    super();

    const { abscissas, ordinates, abscissaScale, ordinateScale, ignoreValue } =
      params;

    // Positions need to be scaled to compute the number of segments
    const xs = new Float64Array(ordinates.length);
    const ys = new Float64Array(ordinates.length);
    for (const [index, value] of ordinates.entries()) {
      xs[index] = abscissaScale(abscissas[index]);
      ys[index] = ignoreValue?.(value) ? Number.NaN : ordinateScale(value);
    }

    this.xs = xs;
    this.ys = ys;
    this.slopes = getPchipSlopes(xs, ys);
    this.segmentCountsPerInterval = getSegmentCounts(xs, ys);

    const total = this.segmentCountsPerInterval.reduce(
      (sum, count) => sum + count,
      0,
    );
    this.positions = createBufferAttr(Math.max(total, 1) * 2); // two positions per line segment (at least one segment, to keep three happy)

    // Parts of `LineGeometry#setPositions` that don't need to be called on every update
    // https://github.com/mrdoob/three.js/blob/40728556ec00833b54be287807cd6fb04a897313/examples/jsm/lines/LineSegmentsGeometry.js#L97
    const { array } = this.positions;
    const instancedBuffer = new InstancedInterleavedBuffer(array, 2 * 3); // two sets of `xyz` coords per line segment
    const startAttr = new InterleavedBufferAttribute(instancedBuffer, 3, 0);
    const endAttr = new InterleavedBufferAttribute(instancedBuffer, 3, 3);
    this.setAttribute('instanceStart', startAttr);
    this.setAttribute('instanceEnd', endAttr);
    this.instanceCount = startAttr.count;
  }

  public update(): void {
    const {
      xs,
      ys,
      slopes,
      segmentCountsPerInterval: counts,
      positions,
    } = this;

    if (counts.every((count) => count === 0)) {
      positions.setXYZ(0, 0, 0, Z_OUT);
      positions.setXYZ(1, 0, 0, Z_OUT);
      return;
    }

    let posIndex = 0;
    for (const [index, count] of counts.entries()) {
      for (let segment = 0; segment < count; segment++) {
        for (const t of [segment / count, (segment + 1) / count]) {
          const x = xs[index] + t * (xs[index + 1] - xs[index]);
          const y = evalHermite(xs, ys, slopes, index, t);
          positions.setXYZ(posIndex++, x, y, 0);
        }
      }
    }
  }
}

function getSegmentCounts(xs: NumArray, ys: NumArray): Uint32Array {
  const counts = new Uint32Array(Math.max(xs.length - 1, 0));

  for (let index = 0; index < counts.length; index++) {
    const dx = Math.abs(xs[index + 1] - xs[index]);
    const dy = Math.abs(ys[index + 1] - ys[index]);

    // Intervals with a non-finite end have no segments
    if (Number.isFinite(dx) && Number.isFinite(dy)) {
      counts[index] = dx !== 0 ? Math.ceil(dx * SEGMENTS_PER_PIXEL) : 1;
    }
  }

  return counts;
}

export default LinePchipGeometry;
