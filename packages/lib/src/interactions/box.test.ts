import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';

import Box from './box';

const ZERO_COORDS = { x: 0, y: 0, z: 0 };

describe('size', () => {
  it('should compute box size', () => {
    const box1 = Box.empty();
    expect(box1.size).toEqual({ width: 0, height: 0 });

    const box2 = Box.empty(new Vector3(10, 10));
    expect(box2.size).toEqual({ width: 0, height: 0 });

    const box3 = Box.empty().expandByPoint(new Vector3(10, -5));
    expect(box3.size).toEqual({ width: 10, height: 5 });
  });
});

describe('center', () => {
  it('should compute box center', () => {
    const box1 = Box.empty();
    expect(box1.center).toMatchObject(ZERO_COORDS);

    const box2 = Box.empty(new Vector3(10, 10));
    expect(box2.center).toMatchObject({ x: 10, y: 10, z: 0 });

    const box3 = Box.empty().expandByPoint(new Vector3(10, -5));
    expect(box3.center).toMatchObject({ x: 5, y: -2.5, z: 0 });
  });
});

describe('empty', () => {
  it('should create empty box at (0, 0, 0)', () => {
    const box = Box.empty();

    expect(box.size).toEqual({ width: 0, height: 0 });
    expect(box.center).toMatchObject(ZERO_COORDS);

    // Check that `min` and `max` are not (+∞, +∞, +∞)` and (-∞, -∞, -∞) respectively, which are the defaults when calling `new Box()`
    expect(box.min).toMatchObject(ZERO_COORDS);
    expect(box.max).toMatchObject(ZERO_COORDS);
    expect(box.min).not.toBe(box.max); // different `Vector3` instances
  });

  it('should create empty box at given coordinates', () => {
    const box = Box.empty(new Vector3(10, 20));

    const expectedCoords = { x: 10, y: 20, z: 0 };
    expect(box.size).toEqual({ width: 0, height: 0 });
    expect(box.center).toMatchObject(expectedCoords);
    expect(box.min).toMatchObject(expectedCoords);
    expect(box.max).toMatchObject(expectedCoords);
  });
});

describe('fromPoints', () => {
  it('should create box that includes all given points', () => {
    const pt1 = new Vector3(10, 10);
    const pt2 = new Vector3(-5, 12);
    const box = Box.fromPoints(pt1, pt2);

    expect(box.containsPoint(pt1)).toBe(true);
    expect(box.containsPoint(pt2)).toBe(true);
    expect(box.min).toMatchObject({ x: -5, y: 10 }); // not the same as pt1
    expect(box.max).toMatchObject({ x: 10, y: 12 }); // not the same as pt2
  });

  it('should create empty box when called with single point', () => {
    const box = Box.fromPoints(new Vector3(-5, 12));
    expect(box.size).toEqual({ width: 0, height: 0 });
    expect(box.center).toMatchObject({ x: -5, y: 12 });
  });
});

describe('fromSize', () => {
  it('should create box with given size centered on (0, 0, 0)', () => {
    const size = { width: 10, height: 20 };
    const box = Box.fromSize(size);

    expect(box.size).toEqual(size);
    expect(box.center).toMatchObject(ZERO_COORDS);
  });
});

describe('clampPoint', () => {
  it('should clamp given point to box', () => {
    const box = Box.empty().expandByPoint(new Vector3(5, 15)); // min: (0, 0, 0); max: (5, 15, 0)

    const pt = new Vector3(10, 10);
    const clampedPt = box.clampPoint(pt);

    expect(clampedPt).toMatchObject({ x: 5, y: 10, z: 0 });
    expect(clampedPt).not.toBe(pt); // new `Vector3` instance
  });
});

describe('expandBySize', () => {
  it('should expand box by given positive width/height', () => {
    const box1 = Box.empty().expandBySize(10, 20);
    expect(box1.size).toEqual({ width: 10, height: 20 });
    expect(box1.center).toMatchObject(ZERO_COORDS); // no shift

    const box2 = Box.empty(new Vector3(-5, 10)).expandBySize(10, 20);
    expect(box2.size).toEqual({ width: 10, height: 20 });
    expect(box2.center).toMatchObject({ x: -5, y: 10 }); // no shift
  });

  it('should shrink box by given negative width/height', () => {
    const box = Box.fromSize({ width: 10, height: 20 }).expandBySize(-5, -25);
    expect(box.size).toEqual({ width: 5, height: 0 });
  });
});

describe('expandToRatio', () => {
  it('should expand box to given ratio', () => {
    const box1 = Box.empty().expandBySize(10, 10).expandToRatio(2);
    expect(box1.size).toEqual({ width: 20, height: 10 });
    expect(box1.center).toMatchObject(ZERO_COORDS); // no shift

    const box2 = Box.empty().expandBySize(10, 10).expandToRatio(0.5);
    expect(box2.size).toEqual({ width: 10, height: 20 });
    expect(box2.center).toMatchObject(ZERO_COORDS); // no shift
  });

  it('should have no effect on empty box', () => {
    const rawBox1 = Box.empty();
    const box1 = rawBox1.clone().expandToRatio(2);
    expect(box1.min).toEqual(rawBox1.min);
    expect(box1.max).toEqual(rawBox1.max);

    const rawBox2 = Box.empty(new Vector3(10, 10));
    const box2 = rawBox2.clone().expandToRatio(2);
    expect(box2.min).toEqual(rawBox2.min);
    expect(box2.max).toEqual(rawBox2.max);
  });

  it('should have no effect when given invalid ratio', () => {
    const rawBox1 = Box.empty(new Vector3(10, 10)).expandBySize(20, 20);
    const box1 = rawBox1.clone().expandToRatio(undefined); // undefined
    expect(box1.min).toEqual(rawBox1.min);
    expect(box1.max).toEqual(rawBox1.max);

    const rawBox2 = Box.empty(new Vector3(10, 10)).expandBySize(20, 20);
    const box2 = rawBox2.clone().expandToRatio(0); // zero
    expect(box2.min).toEqual(rawBox2.min);
    expect(box2.max).toEqual(rawBox2.max);

    const rawBox3 = Box.empty(new Vector3(10, 10)).expandBySize(20, 20);
    const box3 = rawBox3.clone().expandToRatio(-2); // negative
    expect(box3.min).toEqual(rawBox3.min);
    expect(box3.max).toEqual(rawBox3.max);
  });
});

describe('hasMinSize', () => {
  it('should check if box has at least given width and height', () => {
    const box1 = Box.empty();
    expect(box1.hasMinSize(0)).toBe(true);
    expect(box1.hasMinSize(0, 0)).toBe(true);
    expect(box1.hasMinSize(0, 1)).toBe(false);
    expect(box1.hasMinSize(1, 0)).toBe(false);

    const box2 = Box.fromSize({ width: 20, height: 10 });
    expect(box2.hasMinSize(10)).toBe(true);
    expect(box2.hasMinSize(15)).toBe(false); // min height defaults to given min width
    expect(box2.hasMinSize(15, 10)).toBe(true);
  });
});

describe('keepWithin', () => {
  it('should shift box within bounds of bigger given box', () => {
    const box = Box.empty(new Vector3(10, 10)).expandBySize(10, 10);
    const boundingBox = Box.empty().expandBySize(20, 20);
    expect(boundingBox.containsBox(box)).toBe(false); // partially outside

    const shiftedBox = box.clone().keepWithin(boundingBox);
    expect(boundingBox.containsBox(shiftedBox)).toBe(true); // now inside

    expect(shiftedBox.size).toEqual(box.size); // same size
    expect(shiftedBox.center).not.toEqual(box.center); // ... but shifted
  });

  it('should center box around smaller given box', () => {
    const box = Box.empty(new Vector3(10, 10)).expandBySize(20, 20);
    const boundingBox = Box.empty().expandBySize(10, 10);
    expect(boundingBox.containsBox(box)).toBe(false); // completely outside

    const shiftedBox = box.clone().keepWithin(boundingBox);
    expect(boundingBox.containsBox(shiftedBox)).toBe(false); // now around, not inside

    expect(shiftedBox.size).toEqual(box.size); // same size
    expect(shiftedBox.center).not.toEqual(box.center); // ... but shifted
    expect(shiftedBox.center).toEqual(boundingBox.center); // ... and centered around bounding box
  });
});

describe('toRect', () => {
  it('should convert box to `Rect` array', () => {
    const box1 = Box.empty();
    expect(box1.toRect()).toEqual([new Vector3(), new Vector3()]);

    const box2 = Box.fromPoints(new Vector3(-10, 10), new Vector3(10, -10));
    expect(box2.toRect()).toEqual([
      new Vector3(-10, -10, 0),
      new Vector3(10, 10, 0),
    ]);
  });
});
