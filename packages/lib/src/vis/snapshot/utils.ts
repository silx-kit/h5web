/* Pure helpers for `render.ts`, kept free of DOM access for unit testing. */

export interface BoxRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ParsedGradient {
  direction: 'top' | 'right' | 'bottom' | 'left';
  stops: { color: string; offset: number }[];
}

// Conservative canvas limits that work in all major browsers (Safari: 16,777,216 px in area)
export const MAX_CANVAS_SIDE = 16_384;
export const MAX_CANVAS_AREA = 16_777_216;

/* Split on a separator, ignoring separators nested in parentheses (e.g. in `rgb(...)`). */
export function splitTopLevel(str: string, separator = ','): string[] {
  const parts = [''];
  let depth = 0;

  for (const char of str) {
    depth += char === '(' ? 1 : char === ')' ? -1 : 0;
    if (char === separator && depth === 0) {
      parts.push('');
    } else {
      parts[parts.length - 1] += char;
    }
  }

  return parts.map((part) => part.trim()).filter(Boolean);
}

/* Parse a computed `linear-gradient(to <side>, <color> [<percentage>], ...)`, as
 * generated for the colour bar. Stops without position are spread evenly. */
export function parseLinearGradient(value: string): ParsedGradient | undefined {
  const match = /^linear-gradient\(to (bottom|left|right|top), (.*)\)$/u.exec(
    value.trim(),
  );
  if (!match) {
    return undefined;
  }

  const args = splitTopLevel(match[2]);
  const stops = args.map((arg, index) => {
    const [color, position = ''] = splitTopLevel(arg, ' ');
    const offset = position.endsWith('%')
      ? Number.parseFloat(position) / 100
      : index / (args.length - 1);
    return { color, offset: Math.min(1, Math.max(0, offset)) };
  });

  return stops.length > 1
    ? { direction: match[1] as ParsedGradient['direction'], stops }
    : undefined;
}

function isFullInvert(fn: string | undefined): boolean {
  return fn !== undefined && /^invert\((?:1|100%)?\)$/u.test(fn);
}

/* Combine the computed `filter` values of an element and its ancestors (element
 * first) into one `ctx.filter` value. Pairs of `invert()` cancel out, as with
 * filter-based dark modes that re-invert canvases and colour bars. */
export function combineFilters(filters: string[]): string {
  const reduced: string[] = [];
  for (const fn of filters
    .filter((f) => f && f !== 'none')
    .flatMap((f) => splitTopLevel(f, ' '))) {
    if (isFullInvert(fn) && isFullInvert(reduced.at(-1))) {
      reduced.pop();
    } else {
      reduced.push(fn);
    }
  }

  return reduced.length > 0 ? reduced.join(' ') : 'none';
}

/* Alpha channel of a computed colour (`rgb()`/`rgba()` syntaxes); 1 if unknown. */
export function getColorAlpha(color: string): number {
  if (color === 'transparent') {
    return 0;
  }

  const match =
    /^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)(%?)\s*\)$/u.exec(color) ??
    /^rgba?\([^/]+\/\s*([\d.]+)(%?)\s*\)$/u.exec(color);
  if (!match) {
    return 1;
  }

  const value = Number.parseFloat(match[1]);
  return match[2] ? value / 100 : value;
}

/* Reduce the requested pixel ratio if needed so the output canvas stays within
 * browser limits; returns the scale to use. */
export function getSafeScale(
  width: number,
  height: number,
  scale: number,
): number {
  const maxForSides = MAX_CANVAS_SIDE / Math.max(width, height, 1);
  const maxForArea = Math.sqrt(MAX_CANVAS_AREA / Math.max(width * height, 1));
  return Math.min(scale, maxForSides, maxForArea);
}

export function getSnapshotFilename(title: string | undefined): string {
  const base = (title ?? '')
    .trim()
    .replaceAll(/[^\p{L}\p{N} \-._]+/gu, '')
    .replaceAll(/\s+/gu, '_')
    .replace(/^[-._]+/u, '') // no hidden or option-like file names
    .slice(0, 64);

  return `${base || 'snapshot'}.png`;
}
