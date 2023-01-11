import type { ModifierKey, Rect } from './models';

export function getModifierKeyArray(
  keys: ModifierKey | ModifierKey[] | undefined = []
): ModifierKey[] {
  return Array.isArray(keys) ? keys : [keys];
}

export function getSvgRectCoords(rect: Rect) {
  const [start, end] = rect;

  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

export function getSvgLineCoords(rect: Rect) {
  const [start, end] = rect;

  return {
    x1: start.x,
    y1: start.y,
    x2: end.x,
    y2: end.y,
  };
}
