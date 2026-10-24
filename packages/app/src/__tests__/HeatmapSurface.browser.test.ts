import { afterEach, beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';

import { getSelectedVisTab, getVisTabs, renderApp } from '../test-utils';
import { Vis } from '../vis-packs/core/visualizations';
import { NxDataVis } from '../vis-packs/nexus/visualizations';

function surfaceBtn() {
  return page.getByRole('button', { name: 'Show as 3D surface' });
}

function heightSlider() {
  return page.getByRole('slider', { name: 'Height scale' });
}

function resetViewBtn() {
  return page.getByRole('button', { name: 'Reset view' });
}

/* Each switch between heatmap and surface creates a new WebGL context, which takes ~0.7 s with
 * SwiftShader on an idle machine (profiled: `getContext` dominates; geometry, labels and React work
 * take a few ms) and more when many test files create contexts in parallel, as in CI.
 * ("THREE.WebGLRenderer: Context Lost." is R3F disposing the previous canvas on unmount.) */
const SURFACE_TEST_TIMEOUT = 20_000;

/* In 3D, the toolbar gets wider (height slider), so at the default 1920px viewport
 * it re-measures after the switch and moves its last controls (Flip Y, Keep ratio, Grid) into the
 * "More controls" menu. Querying those controls during that re-layout made tests flaky (the button
 * would detach and the locator would wait until timeout). Use a viewport wide enough for the whole
 * 3D toolbar to fit, so no control moves. */
beforeEach(async () => {
  await page.viewport(2560, 1080);
});

afterEach(async () => {
  await page.viewport(1920, 1080);
});

test(
  'extend heatmap into 3D surface and back',
  async () => {
    const { user } = await renderApp('/arrays/twoD');

    expect(getVisTabs()).toEqual([Vis.Matrix, Vis.Line, Vis.Heatmap]);
    expect(getSelectedVisTab()).toBe(Vis.Heatmap);
    expect(surfaceBtn()).toHaveAttribute('aria-pressed', 'false');
    expect(heightSlider()).not.toBeInTheDocument();

    await user.click(surfaceBtn());

    // Same vis tab, same dataset, now rendered as a surface
    expect(getSelectedVisTab()).toBe(Vis.Heatmap);
    expect(surfaceBtn()).toHaveAttribute('aria-pressed', 'true');
    await expect
      .element(page.getByRole('figure', { name: 'twoD' }))
      .toBeVisible();
    await expect.element(resetViewBtn()).toBeVisible();
    expect(heightSlider()).toHaveValue('0.5');

    await user.click(surfaceBtn());

    expect(surfaceBtn()).toHaveAttribute('aria-pressed', 'false');
    expect(resetViewBtn()).not.toBeInTheDocument();
    expect(heightSlider()).not.toBeInTheDocument();
  },
  SURFACE_TEST_TIMEOUT,
);

test(
  'carry heatmap settings over to 3D surface',
  async () => {
    const { user } = await renderApp('/arrays/twoD');

    await user.click(page.getByRole('button', { name: 'Invert' }));
    await user.click(page.getByRole('button', { name: 'Keep ratio' }));

    await user.click(surfaceBtn());
    await expect.element(resetViewBtn()).toBeVisible();

    expect(page.getByRole('button', { name: 'Invert' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(page.getByRole('button', { name: 'Keep ratio' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  },
  SURFACE_TEST_TIMEOUT,
);

test(
  'keep settings changed in 3D when going back to heatmap',
  async () => {
    const { user } = await renderApp('/arrays/twoD');

    await user.click(surfaceBtn());
    await user.click(page.getByRole('button', { name: 'Flip X' }));
    await user.click(surfaceBtn());

    expect(resetViewBtn()).not.toBeInTheDocument();
    expect(page.getByRole('button', { name: 'Flip X' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
  SURFACE_TEST_TIMEOUT,
);

test(
  'keep current slice and 3D mode when switching',
  async () => {
    const { user, selectExplorerNode } = await renderApp('/arrays/threeD');

    const d0Slider = page.getByRole('slider', { name: 'D0' });
    await user.type(d0Slider, '{ArrowUp}');
    expect(d0Slider).toHaveValue(1);

    await user.click(surfaceBtn());
    await expect.element(resetViewBtn()).toBeVisible();
    expect(d0Slider).toHaveValue(1);

    // 3D mode is remembered when selecting another dataset
    await selectExplorerNode('twoD');
    expect(surfaceBtn()).toHaveAttribute('aria-pressed', 'true');
    await expect
      .element(page.getByRole('figure', { name: 'twoD' }))
      .toBeVisible();
    await expect.element(resetViewBtn()).toBeVisible();
  },
  SURFACE_TEST_TIMEOUT,
);

test(
  'show interactions help for 3D surface',
  async () => {
    const { user } = await renderApp('/arrays/twoD');
    await user.click(surfaceBtn());

    await user.click(page.getByRole('button', { name: 'Show help' }));
    expect(page.getByText('Rotate')).toBeVisible();
    expect(page.getByText('Select to zoom')).not.toBeInTheDocument();
  },
  SURFACE_TEST_TIMEOUT,
);

test('offer 3D surface for NeXus images but not for complex heatmaps', async () => {
  const { selectNexusExplorerNode } = await renderApp('/nexus/image');

  expect(getSelectedVisTab()).toBe(NxDataVis.NxHeatmap);
  expect(surfaceBtn()).toBeVisible();

  await selectNexusExplorerNode('image_complex');
  expect(getSelectedVisTab()).toBe(NxDataVis.NxHeatmap);
  expect(surfaceBtn()).not.toBeInTheDocument();
});

test(
  'fall back to heatmap for slices with a single row or column',
  async () => {
    const { user, selectExplorerNode } = await renderApp('/arrays/twoD');
    await user.click(surfaceBtn());
    await expect.element(resetViewBtn()).toBeVisible();

    // 1 x 10 dataset: no surface can be built
    await selectExplorerNode('twoD_negative');
    expect(surfaceBtn()).not.toBeInTheDocument();
    expect(resetViewBtn()).not.toBeInTheDocument();
    await expect
      .element(page.getByRole('figure', { name: 'twoD_negative' }))
      .toBeVisible();
  },
  SURFACE_TEST_TIMEOUT,
);

test(
  'show 3D surface of NeXus image with descending axes',
  async () => {
    const { user } = await renderApp('/nexus/descending-axes');
    await user.click(surfaceBtn());

    await expect.element(resetViewBtn()).toBeVisible();
    expect(surfaceBtn()).toHaveAttribute('aria-pressed', 'true');
  },
  SURFACE_TEST_TIMEOUT,
);
