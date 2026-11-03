import { expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';

import { renderApp } from '../test-utils';

// Lower threshold so that confirmed values are small enough to be fetched and visualized
vi.mock(import('../vis-packs/utils'), async (importOriginal) => ({
  ...(await importOriginal()),
  MAX_AUTO_FETCH_SIZE: 100 as never, // bytes (constant has literal type)
}));

test('visualize large dataset value once fetch is confirmed', async () => {
  await renderApp({ initialPath: '/arrays/twoD', waitForLoaders: false });

  await expect
    .element(page.getByText(/too large to be loaded automatically/u))
    .toBeVisible();

  // Rendering the fetched value must not update the guard (cf. `failOnConsole`)
  await page.getByRole('button', { name: 'Load anyway?' }).click();
  await expect.element(page.getByRole('figure')).toBeVisible();
});
