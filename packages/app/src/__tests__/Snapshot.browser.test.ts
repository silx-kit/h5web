import {
  exportSnapshot,
  HeatmapVis,
  mockValues,
  SnapshotBtn,
} from '@h5web/lib';
import { assertDefined, assertNonNull } from '@h5web/shared/guards';
import { createElement as h, useState } from 'react';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { renderApp } from '../test-utils';

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function decodePng(blob: Blob): Promise<ImageData> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  assertNonNull(ctx);
  ctx.drawImage(bitmap, 0, 0);
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
}

/* Region of `elem` relative to the snapshot root, in image pixels */
function getRegion(root: Element, elem: Element, scale = 1): Region {
  const rootRect = root.getBoundingClientRect();
  const rect = elem.getBoundingClientRect();
  return {
    x: Math.round((rect.x - rootRect.x) * scale),
    y: Math.round((rect.y - rootRect.y) * scale),
    width: Math.round(rect.width * scale),
    height: Math.round(rect.height * scale),
  };
}

function getPixels(img: ImageData, region: Region): [number, number, number][] {
  const pixels: [number, number, number][] = [];
  const x0 = Math.max(0, region.x);
  const y0 = Math.max(0, region.y);
  const x1 = Math.min(img.width, region.x + region.width);
  const y1 = Math.min(img.height, region.y + region.height);

  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const i = (y * img.width + x) * 4;
      pixels.push([img.data[i], img.data[i + 1], img.data[i + 2]]);
    }
  }

  return pixels;
}

/* Count pixels that differ noticeably from the background (pixel at 0,0) */
function countInk(img: ImageData, region: Region): number {
  const [bg] = getPixels(img, { x: 0, y: 0, width: 1, height: 1 });
  return getPixels(img, region).filter((px) =>
    px.some((val, i) => Math.abs(val - bg[i]) > 40),
  ).length;
}

function countColor(
  img: ImageData,
  region: Region,
  color: [number, number, number],
  tolerance = 40,
): number {
  return getPixels(img, region).filter((px) =>
    px.every((val, i) => Math.abs(val - color[i]) <= tolerance),
  ).length;
}

async function snapshotWhenRendered(
  figure: HTMLElement,
  scale = 1,
): Promise<ImageData> {
  const canvas = figure.querySelector('canvas');
  assertNonNull(canvas);

  // Wait for WebGL canvas to be painted
  const result: { img?: ImageData } = {};
  await expect
    .poll(async () => {
      result.img = await decodePng(await exportSnapshot(figure, { scale }));
      return countInk(result.img, getRegion(figure, canvas, scale));
    })
    .toBeGreaterThan(1000);

  assertDefined(result.img);
  return result.img;
}

test('export heatmap with title, axes and colour bar', async () => {
  await renderApp('/nexus/NXdata');

  const figure = page.getByRole('figure', { name: 'NeXus 2D' }).element();
  assertNonNull(figure);
  expect(figure).toBeInstanceOf(HTMLElement);
  const root = figure as HTMLElement;

  const img = await snapshotWhenRendered(root);
  const rootRect = root.getBoundingClientRect();
  expect(img.width).toBe(Math.round(rootRect.width));
  expect(img.height).toBe(Math.round(rootRect.height));

  // Background is opaque white (from app theme)
  expect(getPixels(img, { x: 0, y: 0, width: 1, height: 1 })[0]).toEqual([
    255, 255, 255,
  ]);

  // Title text
  const title = page.getByText('NeXus 2D', { exact: true }).element();
  expect(countInk(img, getRegion(root, title))).toBeGreaterThan(50);

  // Axes (tick lines and labels)
  for (const type of ['abscissa', 'ordinate']) {
    const axis = root.querySelector(`svg[data-type="${type}"]`);
    assertNonNull(axis);
    expect(countInk(img, getRegion(root, axis))).toBeGreaterThan(100);
  }

  // Colour bar gradient (viridis min/max colours at bottom/top)
  const gradient = root.querySelector('[data-keep-colors]');
  assertNonNull(gradient);
  const gradientRegion = getRegion(root, gradient);
  const top = { ...gradientRegion, y: gradientRegion.y + 3, height: 5 };
  const bottom = {
    ...gradientRegion,
    y: gradientRegion.y + gradientRegion.height - 8,
    height: 5,
  };
  expect(countColor(img, top, [253, 231, 37])).toBeGreaterThan(20); // yellow
  expect(countColor(img, bottom, [68, 1, 84])).toBeGreaterThan(20); // purple

  // Colour bar bounds and tick labels
  const colorBar = gradient.closest('figure > div');
  assertNonNull(colorBar);
  const colorBarRegion = getRegion(root, colorBar);
  const ticks = {
    ...colorBarRegion,
    x: gradientRegion.x + gradientRegion.width + 2,
    width:
      colorBarRegion.x +
      colorBarRegion.width -
      gradientRegion.x -
      gradientRegion.width -
      2,
  };
  expect(countInk(img, ticks)).toBeGreaterThan(100);
});

test('export at higher resolution', async () => {
  await renderApp('/nexus/NXdata');

  const root = page
    .getByRole('figure', { name: 'NeXus 2D' })
    .element() as HTMLElement;
  const img = await snapshotWhenRendered(root, 2);

  const rootRect = root.getBoundingClientRect();
  expect(img.width).toBe(Math.round(rootRect.width * 2));
  expect(img.height).toBe(Math.round(rootRect.height * 2));

  const title = page.getByText('NeXus 2D', { exact: true }).element();
  expect(countInk(img, getRegion(root, title, 2))).toBeGreaterThan(200);
});

test('paint background of snapshot root below plot and axes', async () => {
  await renderApp('/nexus/NXdata');

  const root = page
    .getByRole('figure', { name: 'NeXus 2D' })
    .element() as HTMLElement;
  root.style.backgroundColor = 'rgb(238, 238, 255)';

  const img = await snapshotWhenRendered(root);
  expect(getPixels(img, { x: 0, y: 0, width: 1, height: 1 })[0]).toEqual([
    238, 238, 255,
  ]);

  const axis = root.querySelector('svg[data-type="abscissa"]');
  assertNonNull(axis);
  expect(countInk(img, getRegion(root, axis))).toBeGreaterThan(100);
});

test('composite translucent root background over ancestors', async () => {
  await renderApp('/nexus/NXdata');

  const root = page
    .getByRole('figure', { name: 'NeXus 2D' })
    .element() as HTMLElement;
  root.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // over app's white background

  const img = await snapshotWhenRendered(root);
  const [[r, g, b]] = getPixels(img, { x: 0, y: 0, width: 1, height: 1 });
  expect(r).toBe(255);
  expect(g).toBeCloseTo(128, -1);
  expect(b).toBeCloseTo(128, -1);
});

test('apply CSS transform scale to text', async () => {
  const container = document.createElement('div');
  container.style.cssText =
    'position: fixed; top: 0; left: 0; width: 400px; height: 100px; background: white;';
  const label = document.createElement('span');
  label.textContent = 'Scaled label';
  label.style.cssText =
    'display: inline-block; font: 16px sans-serif; color: black; transform: scale(2); transform-origin: top left;';
  container.append(label);
  document.body.append(container);

  try {
    const img = await decodePng(await exportSnapshot(container, { scale: 1 }));
    const labelRect = label.getBoundingClientRect();

    // Ink must extend over (nearly) the whole scaled width of the label
    const rightHalf = {
      x: Math.round(labelRect.width * 0.6),
      y: 0,
      width: Math.round(labelRect.width * 0.4),
      height: 100,
    };
    expect(countInk(img, rightHalf)).toBeGreaterThan(50);

    // ... and nothing beyond it
    const beyond = {
      x: Math.round(labelRect.width) + 4,
      y: 0,
      width: 400 - Math.round(labelRect.width) - 4,
      height: 100,
    };
    expect(countInk(img, beyond)).toBe(0);
  } finally {
    container.remove();
  }
});

test('export line with legend for auxiliary signals', async () => {
  await renderApp('/nexus/spectrum_with_aux');

  const root = page.getByRole('figure').element() as HTMLElement;
  const legend = page.getByRole('list').filter({ hasText: 'secondary' });

  // Legend only appears in snapshot
  expect(legend).not.toBeInTheDocument(); // `display: none` (not in accessibility tree)

  const img = await snapshotWhenRendered(root);
  expect(root).not.toHaveAttribute('data-snapshot'); // cleaned up

  const canvas = root.querySelector('canvas');
  assertNonNull(canvas);
  const canvasRegion = getRegion(root, canvas);

  // Legend is in the top-right corner of the plot area
  const legendRegion = {
    x: canvasRegion.x + canvasRegion.width - 250,
    y: canvasRegion.y,
    width: 250,
    height: 110,
  };
  expect(countInk(img, legendRegion)).toBeGreaterThan(200);

  // Legend marks are drawn in the auxiliary curve colours
  expect(countColor(img, legendRegion, [255, 69, 0], 30)).toBeGreaterThan(20); // orangered
  expect(countColor(img, legendRegion, [34, 139, 34], 30)).toBeGreaterThan(20); // forestgreen

  // Axis label is included
  const abscissa = root.querySelector('svg[data-type="abscissa"]');
  assertNonNull(abscissa);
  expect(countInk(img, getRegion(root, abscissa))).toBeGreaterThan(100);
});

test('download snapshot from toolbar', async () => {
  const { user } = await renderApp('/nexus/NXdata');

  const clickSpy = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {});

  await user.click(page.getByRole('button', { name: 'Snapshot' }));
  await user.click(page.getByRole('button', { name: 'Save as PNG (2×)' }));

  await expect.poll(() => clickSpy.mock.calls.length).toBe(1);
  const anchor = clickSpy.mock.contexts[0] as HTMLAnchorElement;
  expect(anchor.download).toBe('NeXus_2D.png');
  expect(anchor.href).toMatch(/^blob:/u);
});

function mockDownloads() {
  const clickSpy = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {});
  return () =>
    clickSpy.mock.contexts.map((a) => (a as HTMLAnchorElement).download);
}

test('snapshot right visualization when several on page', async () => {
  const getDownloads = mockDownloads();
  const dataArray = mockValues.twoD();
  const style = { display: 'flex', width: 600, height: 200 };

  // Toolbars rendered apart from their visualizations, with explicit targets
  function Detached() {
    const [visA, setVisA] = useState<HTMLElement | null>(null);
    const [visB, setVisB] = useState<HTMLElement | null>(null);
    return h('div', null, [
      h('header', { key: 'bar' }, [
        h(SnapshotBtn, { key: 'a', target: visA }),
        h(SnapshotBtn, { key: 'b', target: visB }),
      ]),
      h(
        'div',
        { key: 'a', ref: setVisA, style },
        h(HeatmapVis, { dataArray, domain: [0, 400], title: 'Vis A' }),
      ),
      h(
        'div',
        { key: 'b', ref: setVisB, style },
        h(HeatmapVis, { dataArray, domain: [0, 400], title: 'Vis B' }),
      ),
    ]);
  }

  // Toolbars rendered next to their visualizations, without targets
  function Adjacent() {
    return h(
      'div',
      null,
      ['C', 'D'].map((name) =>
        h('section', { key: name }, [
          h(SnapshotBtn, { key: 'btn' }),
          h(
            'div',
            { key: 'vis', style },
            h(HeatmapVis, {
              dataArray,
              domain: [0, 400],
              title: `Vis ${name}`,
            }),
          ),
        ]),
      ),
    );
  }

  await render(
    h('div', null, [h(Detached, { key: 1 }), h(Adjacent, { key: 2 })]),
  );
  const btns = page.getByRole('button', { name: 'Snapshot' });

  async function snapshotVia(index: number) {
    const count = getDownloads().length;
    await userEvent.click(btns.nth(index));
    // Playwright's actionability checks time out on this menu here, so click directly
    (
      page
        .getByRole('button', { name: 'Save as PNG', exact: true })
        .element() as HTMLElement
    ).click();
    await expect.poll(() => getDownloads().length).toBe(count + 1);
  }

  await snapshotVia(1);
  await snapshotVia(0);
  await snapshotVia(3);
  await snapshotVia(2);

  expect(getDownloads()).toEqual([
    'Vis_B.png',
    'Vis_A.png',
    'Vis_D.png',
    'Vis_C.png',
  ]);
});

test('report failed snapshot', async () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const empty = document.createElement('div');
  await render(h(SnapshotBtn, { target: empty }));

  await userEvent.click(page.getByRole('button', { name: 'Snapshot' }));
  await userEvent.click(
    page.getByRole('button', { name: 'Save as PNG', exact: true }),
  );

  await expect
    .element(page.getByRole('button', { name: 'Snapshot failed' }))
    .toBeVisible();
  expect(errorSpy).toHaveBeenCalledWith('Snapshot failed:', expect.any(Error));
});
