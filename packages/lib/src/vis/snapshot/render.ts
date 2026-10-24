/* eslint-disable no-param-reassign -- painting mutates the 2D context's state */
import {
  combineFilters,
  getColorAlpha,
  getSafeScale,
  parseLinearGradient,
} from './utils';

/* Attribute set on the snapshot root while it is being captured, to reveal
 * snapshot-only elements (e.g. the line legend): `[data-snapshot] .elem {}` */
export const SNAPSHOT_ATTR = 'data-snapshot';

/* Elements with this attribute (and their descendants) are left out of snapshots. */
export const SNAPSHOT_IGNORE_ATTR = 'data-snapshot-ignore';

export interface SnapshotOptions {
  /* Pixel ratio of the output image; defaults to `devicePixelRatio`. May be
   * reduced to keep the image within browser canvas size limits. */
  scale?: number;
  /* Defaults to the background of the element or its nearest opaque ancestor
   * (themes and filter-based dark modes are respected). `null` for transparent. */
  background?: string | null;
}

type Draw = (ctx: CanvasRenderingContext2D) => void;
interface Layer {
  filter: string;
  draw: Draw | Promise<Draw>; // async for images that need decoding
}

// Computed styles inlined into serialised SVGs (CSS rules don't apply in `<img>`)
const SVG_STYLE_PROPS = `fill fill-opacity stroke stroke-width stroke-opacity
  stroke-dasharray opacity visibility display overflow font-family font-size
  font-weight font-style text-anchor dominant-baseline filter`.split(/\s+/u);

function getFilter(elem: Element): string {
  const filters: string[] = [];
  for (let node: Element | null = elem; node; node = node.parentElement) {
    filters.push(getComputedStyle(node).filter);
  }
  return combineFilters(filters);
}

function isRendered(elem: Element): boolean {
  const { width, height } = elem.getBoundingClientRect();
  return (
    width > 0 &&
    height > 0 &&
    getComputedStyle(elem).visibility === 'visible' &&
    !elem.closest(`[${SNAPSHOT_IGNORE_ATTR}]`)
  );
}

function drawImage(image: CanvasImageSource, rect: DOMRectInit): Draw {
  const { x = 0, y = 0, width = 0, height = 0 } = rect;
  return (ctx) => ctx.drawImage(image, x, y, width, height);
}

function canvasLayer(canvas: HTMLCanvasElement): Layer {
  // Copy synchronously while the WebGL drawing buffer matches the screen
  const copy = document.createElement('canvas');
  copy.width = canvas.width;
  copy.height = canvas.height;
  copy.getContext('2d')?.drawImage(canvas, 0, 0);
  const draw = drawImage(copy, canvas.getBoundingClientRect());
  return { filter: getFilter(canvas), draw };
}

function svgLayer(svg: SVGSVGElement, scale: number): Layer {
  const rect = svg.getBoundingClientRect();
  const style = getComputedStyle(svg);
  const width = Number.parseFloat(style.width) || rect.width; // untransformed size
  const height = Number.parseFloat(style.height) || rect.height;
  const [sx, sy] = [rect.width / width, rect.height / height]; // CSS transform scale

  // Content of SVGs with `overflow: visible` (e.g. axes) may extend beyond their box
  let [x, y, w, h] = [0, 0, width, height];
  if (style.overflow === 'visible') {
    const bbox = svg.getBBox();
    x = Math.min(0, bbox.x - 2); // margin for strokes
    y = Math.min(0, bbox.y - 2);
    w = Math.max(width, bbox.x + bbox.width + 2) - x;
    h = Math.max(height, bbox.y + bbox.height + 2) - y;
  }

  const clone = svg.cloneNode(true) as SVGSVGElement;
  const originals = [svg, ...svg.querySelectorAll('*')];
  [clone, ...clone.querySelectorAll('*')].forEach((node, index) => {
    const computed = getComputedStyle(originals[index]);
    const decls = SVG_STYLE_PROPS.map(
      (prop) => `${prop}:${computed.getPropertyValue(prop)}`,
    );
    node.setAttribute('style', decls.join(';'));
  });

  if (!svg.hasAttribute('viewBox')) {
    clone.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
  }
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', `${w * sx * scale}`); // rasterise at output resolution
  clone.setAttribute('height', `${h * sy * scale}`);
  clone.style.setProperty('overflow', 'hidden');
  clone.style.setProperty('filter', 'none'); // applied via `ctx.filter`

  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    new XMLSerializer().serializeToString(clone),
  )}`;
  const target = {
    x: rect.x + x * sx,
    y: rect.y + y * sy,
    width: w * sx,
    height: h * sy,
  };
  async function decoded(): Promise<Draw> {
    await img.decode();
    return drawImage(img, target);
  }

  return { filter: getFilter(svg), draw: decoded() };
}

function boxLayer(elem: HTMLElement, style: CSSStyleDeclaration) {
  const { x, y, width, height } = elem.getBoundingClientRect();
  const { backgroundColor, backgroundImage, borderTopColor } = style;
  const gradient = parseLinearGradient(backgroundImage);
  const hasBg = getColorAlpha(backgroundColor) > 0;
  const border = Math.max(
    ...['top', 'right', 'bottom', 'left'].map((side) =>
      style.getPropertyValue(`border-${side}-style`) === 'none'
        ? 0
        : Number.parseFloat(style.getPropertyValue(`border-${side}-width`)),
    ),
  );

  if (!hasBg && !gradient && !border) {
    return undefined;
  }

  function draw(ctx: CanvasRenderingContext2D) {
    if (hasBg) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(x, y, width, height);
    }

    if (gradient) {
      const { direction, stops } = gradient;
      const gradientFill = ctx.createLinearGradient(
        direction === 'left' ? x + width : x,
        direction === 'top' ? y + height : y,
        direction === 'right' ? x + width : x,
        direction === 'bottom' ? y + height : y,
      );
      stops.forEach(({ offset, color }) => {
        gradientFill.addColorStop(offset, color);
      });
      ctx.fillStyle = gradientFill;
      ctx.fillRect(x, y, width, height);
    }

    if (border) {
      // Drawn uniformly, with the top border's colour and no radius
      ctx.strokeStyle = borderTopColor;
      ctx.lineWidth = border;
      const [bx, by] = [x + border / 2, y + border / 2];
      ctx.strokeRect(bx, by, width - border, height - border);
    }
  }

  return { filter: getFilter(elem), draw };
}

function textLayer(node: Text, style: CSSStyleDeclaration, scale: number[]) {
  const start = node.data.search(/\S/u);
  if (start === -1) {
    return undefined;
  }

  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, node.data.trimEnd().length);
  const rect = range.getBoundingClientRect();
  const text = range.toString().replaceAll(/\s+/gu, ' ');
  const [sx, sy] = scale;

  function draw(ctx: CanvasRenderingContext2D) {
    const { fontStyle, fontWeight, fontSize, fontFamily } = style;
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
    ctx.fillStyle = style.color;
    const { fontBoundingBoxAscent: asc, fontBoundingBoxDescent: desc } =
      ctx.measureText(text);
    ctx.translate(rect.x, rect.y); // `rect` includes CSS transform scale, font metrics don't
    ctx.scale(sx, sy);
    ctx.fillText(text, 0, (rect.height / sy - asc - desc) / 2 + asc);
  }

  return { filter: getFilter(node.parentElement ?? document.body), draw };
}

/* HTML boxes and text (title, colour bar, legend, annotations...) in document order */
function collectHtml(elem: HTMLElement, scale: number[], layers: Layer[]) {
  const style = getComputedStyle(elem);
  if (
    style.display === 'none' ||
    elem instanceof HTMLCanvasElement ||
    elem.hasAttribute(SNAPSHOT_IGNORE_ATTR)
  ) {
    return;
  }

  const { a, b, c, d } = new DOMMatrixReadOnly(
    style.transform === 'none' ? undefined : style.transform,
  );
  const ownScale = [scale[0] * Math.hypot(a, b), scale[1] * Math.hypot(c, d)];
  const visible = isRendered(elem);
  const box = visible && boxLayer(elem, style);
  if (box) {
    layers.push(box);
  }

  for (const child of elem.childNodes) {
    const text =
      visible && child instanceof Text && textLayer(child, style, ownScale);
    if (text) {
      layers.push(text);
    } else if (child instanceof HTMLElement) {
      collectHtml(child, ownScale, layers);
    }
  }
}

function fill(color: string): Draw {
  return (ctx) => {
    ctx.fillStyle = color;
    ctx.fillRect(-1e5, -1e5, 2e5, 2e5);
  };
}

function backgroundLayers(root: HTMLElement, color?: string | null): Layer[] {
  if (color !== undefined) {
    return color === null ? [] : [{ filter: 'none', draw: fill(color) }];
  }

  // Stack backgrounds of root and ancestors up to the first opaque one
  const layers: Layer[] = [];
  for (let node: HTMLElement | null = root; node; node = node.parentElement) {
    const { backgroundColor } = getComputedStyle(node);
    const alpha = getColorAlpha(backgroundColor);
    if (alpha > 0) {
      layers.unshift({ filter: getFilter(node), draw: fill(backgroundColor) });
      if (alpha >= 1) {
        return layers;
      }
    }
  }
  return [{ filter: 'none', draw: fill('white') }, ...layers]; // browser default
}

/* Render an h5web visualization to a 2D canvas as it appears on screen. Layers
 * are painted in a fixed order, which matches h5web's visualizations:
 * 1. background of the element or its ancestors;
 * 2. canvases (WebGL scene at current zoom level);
 * 3. top-level SVGs (axes, grid, SVG overlays, colour bar axis);
 * 4. HTML boxes and text in document order (title, colour bar, legend, annotations).
 *
 * Not supported: arbitrary CSS stacking (e.g. HTML backgrounds painted below
 * the canvas), overflow clipping other than at the root, rotated or skewed HTML,
 * wrapped text, `opacity` on HTML elements, non-uniform or rounded borders,
 * HTML images, and web fonts inside SVGs (system fonts are used instead). */
export async function renderSnapshot(
  root: HTMLElement,
  options: SnapshotOptions = {},
): Promise<HTMLCanvasElement> {
  const { x, y, width, height } = root.getBoundingClientRect();
  const defaultScale = Math.max(1, globalThis.devicePixelRatio || 1);
  const scale = getSafeScale(width, height, options.scale ?? defaultScale);

  const layers: Layer[] = [];
  root.setAttribute(SNAPSHOT_ATTR, '');
  try {
    layers.push(...backgroundLayers(root, options.background));

    const canvases = [...root.querySelectorAll('canvas')].filter(isRendered);
    layers.push(...canvases.map(canvasLayer));

    const svgs = [...root.querySelectorAll('svg')].filter(
      (svg) => !svg.parentElement?.closest('svg') && isRendered(svg),
    );
    layers.push(...svgs.map((svg) => svgLayer(svg, scale)));

    for (const child of root.children) {
      if (child instanceof HTMLElement) {
        collectHtml(child, [1, 1], layers); // root's background already painted
      }
    }
  } finally {
    root.removeAttribute(SNAPSHOT_ATTR);
  }

  const draws = await Promise.allSettled(layers.map(async (l) => l.draw));

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D canvas context');
  }

  const transform = new DOMMatrix().scale(scale).translate(-x, -y);
  draws.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn('Snapshot: skipped layer', result.reason); // eslint-disable-line no-console
      return;
    }

    ctx.save();
    ctx.setTransform(transform);
    ctx.filter = layers[index].filter;
    result.value(ctx);
    ctx.restore();
  });

  return canvas;
}

/* Same as `renderSnapshot`, but returns a PNG blob. */
export async function exportSnapshot(
  root: HTMLElement,
  options?: SnapshotOptions,
): Promise<Blob> {
  const canvas = await renderSnapshot(root, options);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });
  if (!blob) {
    throw new Error('Could not encode snapshot as PNG');
  }
  return blob;
}

/* Find the visualization (`figure` around the first canvas) for an element that
 * is either the visualization, a container of it, or a descendant of a container
 * of it (e.g. a toolbar button rendered next to it). */
export function findVisElement(from: Element): HTMLElement | undefined {
  for (let node: Element | null = from; node; node = node.parentElement) {
    const canvas = node.querySelector('canvas');
    if (canvas) {
      return canvas.closest('figure') ?? canvas.parentElement ?? undefined;
    }
  }
  return undefined;
}
