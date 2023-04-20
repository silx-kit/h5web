import { Box3, Vector3 } from 'three';

import type { Size } from '../vis/models';
import type { Rect } from './models';

const ZERO_VECTOR = new Vector3(0, 0, 0);

class Box extends Box3 {
  public get size(): Size {
    const { x: width, y: height } = this.getSize(new Vector3());
    return { width, height };
  }

  public get center(): Vector3 {
    return this.getCenter(new Vector3());
  }

  public static empty(center = ZERO_VECTOR): Box {
    return new Box(center.clone(), center.clone());
  }

  public static fromPoints(...points: Vector3[]): Box {
    return new Box().setFromPoints(points);
  }

  public static fromSize({ width, height }: Size): Box {
    return Box.empty().expandBySize(width, height);
  }

  public override clampPoint(pt: Vector3): Vector3 {
    return super.clampPoint(pt, new Vector3());
  }

  public expandBySize(width: number, height: number): this {
    const { size } = this;

    /* Prevent shrinking to "negative" size.
     * If `max.x/y` becomes lower than `min.x/y`, then `isEmpty()` returns `true`
     * and `getCenter` and `getSize` return (0, 0, 0) regardless of `min/max`. */
    const w = width < 0 ? Math.max(width, -size.width) : width;
    const h = height < 0 ? Math.max(height, -size.height) : height;

    return this.expandByVector(new Vector3(w, h).divideScalar(2));
  }

  public expandToRatio(ratio: number | undefined): this {
    if (ratio === undefined || ratio <= 0) {
      return this;
    }

    const { width, height } = this.size;
    const originalRatio = width / height;

    if (ratio > originalRatio) {
      return this.expandBySize(height * ratio - width, 0); // increase width
    }

    return this.expandBySize(0, width / ratio - height); // increase height
  }

  public hasMinSize(minWidth: number, minHeight = minWidth): boolean {
    const { width, height } = this.size;
    return width >= minWidth && height >= minHeight;
  }

  public keepWithin(area: Box): this {
    const { center, size } = this;
    const { width: areaWidth, height: areaHeight } = area.size;

    const centerClampingBox = Box.empty(area.center).expandBySize(
      Math.max(areaWidth - size.width, 0),
      Math.max(areaHeight - size.height, 0)
    );

    const shift = centerClampingBox.clampPoint(center).sub(center).setZ(0); // cancel `z` shift

    return this.translate(shift);
  }

  public toRect(): Rect {
    return [this.min, this.max];
  }
}

export default Box;
