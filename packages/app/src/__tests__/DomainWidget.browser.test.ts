import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

import { renderApp } from '../test-utils';

test('show slider with two thumbs and reveal popup on hover', async () => {
  const { user } = await renderApp('/nexus/NXdata');

  const thumbs = page.getByRole('slider');
  expect(thumbs).toHaveLength(2);
  expect(thumbs.nth(0)).toHaveValue(20);
  expect(thumbs.nth(1)).toHaveValue(81);

  const editBtn = page.getByRole('button', { name: 'Edit domain' });
  const popup = page.getByRole('dialog', {
    name: 'Edit domain',
    includeHidden: true,
  });

  expect(editBtn).toHaveAttribute('aria-expanded', 'false');
  expect(popup).not.toBeVisible();

  // Hover to show popup
  await editBtn.hover();
  expect(editBtn).toHaveAttribute('aria-expanded', 'true');
  expect(popup).toBeVisible();

  // Unhover to hide popup
  await editBtn.unhover();
  expect(editBtn).toHaveAttribute('aria-expanded', 'false');
  expect(popup).not.toBeVisible();

  // Hover and press escape to hide popup
  await editBtn.hover();
  await user.keyboard('{Escape}');
  expect(popup).not.toBeVisible();
});

test('show min/max and data range in popup', async () => {
  await renderApp('/nexus/NXdata');

  // Hover edit button to reveal tooltip
  await page.getByRole('button', { name: 'Edit domain' }).hover();
  expect(page.getByRole('dialog', { name: 'Edit domain' })).toBeVisible();

  const minInput = page.getByLabelText('min', { exact: true });
  const maxInput = page.getByLabelText('max', { exact: true });
  expect(minInput).toHaveValue('−9.5e+1');
  expect(maxInput).toHaveValue('4e+2');
  expect(minInput).toHaveAttribute('title', '-95');
  expect(maxInput).toHaveAttribute('title', '400');

  const range = page.getByText('Data range');
  expect(range).toBeVisible();
  expect(range.getByTitle('-95')).toHaveTextContent('−9.5e+1');
  expect(range.getByTitle('400')).toHaveTextContent('4e+2');
});

test('move thumbs with keyboard to update domain', async () => {
  const { user } = await renderApp('/nexus/NXdata');

  // Hover min thumb to reveal tooltip
  const minThumb = page.getByRole('slider', { name: /min/ });
  await minThumb.hover();

  const minInput = page.getByLabelText('min', { exact: true });
  const maxInput = page.getByLabelText('max', { exact: true });

  // Move min thumb one step to the left with keyboard
  await user.type(minThumb, '{ArrowLeft}');
  expect(minInput).toHaveValue('−1.04671e+2');
  expect(page.getByLabelText('Min: −1.047e+2')).toBeVisible();

  // Move min thumb five steps to the left (in a single press)
  await user.type(minThumb, '{ArrowLeft>5/}'); // press key and hold for 5 keydown events, then release
  await expect.element(minInput).toHaveValue('−2.30818e+2');
  expect(page.getByLabelText('Min: −2.308e+2')).toBeVisible();

  expect(minThumb).toHaveValue(20); // still at original position
  expect(maxInput).toHaveValue('4e+2'); // unaffected

  // Move max thumb ten steps to the left
  const maxThumb = page.getByRole('slider', { name: /max/ });
  await user.type(maxThumb, '{PageDown}');
  expect(maxInput).toHaveValue('5.72182e+1');
  expect(page.getByLabelText('Max: 5.722e+1')).toBeVisible();

  // Move max thumb ten steps to the right
  await user.type(maxThumb, '{PageUp}');
  expect(maxInput).toHaveValue('3.68841e+2'); // not back to 4e+2 because 4e+2 is not exactly on a slider division
  expect(page.getByLabelText('Max: 3.688e+2')).toBeInTheDocument();

  expect(maxThumb).toHaveValue(81); // still at original position
  expect(minInput).toHaveValue('−2.30818e+2'); // unaffected
});

test('edit bounds manually', async () => {
  const { user } = await renderApp('/nexus/NXdata');

  const editBtn = page.getByRole('button', { name: 'Edit domain' });
  expect(editBtn).toHaveAttribute('aria-pressed', 'false');

  // Click on edit button to open popup with both min and max in edit mode
  await editBtn.click();
  expect(editBtn).toHaveAttribute('aria-pressed', 'true');
  expect(editBtn).toHaveAttribute('aria-expanded', 'true');
  const minInput = page.getByLabelText('min', { exact: true });
  const maxInput = page.getByLabelText('max', { exact: true });
  const applyMinBtn = page.getByRole('button', { name: 'Apply min' });
  const cancelMinBtn = page.getByRole('button', { name: 'Cancel min' });
  expect(applyMinBtn).toBeEnabled();
  expect(cancelMinBtn).toBeEnabled();
  expect(minInput).toHaveFocus();

  // Type new value in min input field but don't apply it
  await minInput.fill('-100');
  expect(page.getByLabelText('Min: −9.5e+1')).toBeVisible(); // not applied

  // Cancel min editing
  await cancelMinBtn.click();
  expect(minInput).toHaveValue('−9.5e+1'); // reverted
  expect(applyMinBtn).toBeDisabled();
  expect(cancelMinBtn).toBeDisabled();

  // Type new min value again but now apply it
  await minInput.fill('-100');
  await applyMinBtn.click();
  expect(page.getByLabelText('Min: −1e+2')).toBeVisible(); // applied
  expect(editBtn).toHaveAttribute('aria-pressed', 'true'); // because max still in edit mode

  // Type new max value and apply it with Enter
  await maxInput.fill('100000');
  await user.keyboard('{Enter}');

  expect(maxInput).toHaveValue('1e+5'); // auto-format
  expect(page.getByLabelText('Max: 1e+5')).toBeVisible();
  expect(editBtn).toHaveAttribute('aria-pressed', 'false'); // min and max no longer in edit mode
});

test('clamp domain in symlog scale', async () => {
  const { user } = await renderApp('/nexus/NXdata');

  await page.getByRole('button', { name: 'Edit domain' }).click();
  const minThumb = page.getByRole('slider', { name: /min/ });
  const maxThumb = page.getByRole('slider', { name: /max/ });
  const minInput = page.getByLabelText('min', { exact: true });
  const maxInput = page.getByLabelText('max', { exact: true });

  await minInput.fill('-1e+1000');
  await page.getByRole('button', { name: 'Apply min' }).click();
  expect(minInput).toHaveValue('−8.98847e+307');
  expect(minThumb).toHaveValue(1);

  await maxInput.fill('1e+1000');
  await page.getByRole('button', { name: 'Apply max' }).click();
  expect(maxInput).toHaveValue('8.98847e+307');
  expect(maxThumb).toHaveValue(100);

  await user.type(maxThumb, '{ArrowLeft}');
  expect(maxInput).toHaveValue('5.40006e+301');
  expect(maxThumb).toHaveValue(99); // does not jump back to 81
});

test('control min/max autoscale behaviour', async () => {
  const { user } = await renderApp('/nexus/NXdata');

  const minThumb = page.getByRole('slider', { name: /min/ });
  await minThumb.hover();

  const minBtn = page.getByRole('button', { name: 'Min', exact: true });
  const maxBtn = page.getByRole('button', { name: 'Max', exact: true });
  const maxInput = page.getByLabelText('max', { exact: true });

  // Autoscale is enabled for both min and max by default
  expect(minBtn).toHaveAttribute('aria-pressed', 'true');
  expect(maxBtn).toHaveAttribute('aria-pressed', 'true');

  // Moving min thumb disables min autoscale
  await user.type(minThumb, '{ArrowRight}');
  expect(minBtn).toHaveAttribute('aria-pressed', 'false');
  expect(maxBtn).toHaveAttribute('aria-pressed', 'true'); // unaffected

  // Editing max disables max autoscale
  await maxInput.fill('4000');
  await page.getByRole('button', { name: 'Apply max' }).click();
  expect(maxInput).toHaveValue('4e+3');
  expect(maxBtn).toHaveAttribute('aria-pressed', 'false');

  // Re-enable max autoscale
  await maxBtn.click();
  expect(maxBtn).toHaveAttribute('aria-pressed', 'true');
  expect(minBtn).toHaveAttribute('aria-pressed', 'false'); // unaffected
  expect(maxInput).toHaveValue('4e+2');
});

test('handle empty domain', async () => {
  const { user } = await renderApp('/nexus/NXdata');

  await page.getByRole('button', { name: 'Edit domain' }).click();
  const minInput = page.getByLabelText('min', { exact: true });
  const maxInput = page.getByLabelText('max', { exact: true });
  const minThumb = page.getByRole('slider', { name: /min/ });
  const maxThumb = page.getByRole('slider', { name: /max/ });

  // Give min the same value as max
  await minInput.fill('400');
  await page.getByRole('button', { name: 'Apply min' }).click();
  expect(minThumb).toHaveValue(81);
  expect(maxThumb).toHaveValue(81);
  expect(page.getByLabelText('Min: −∞')).toBeVisible();
  expect(page.getByLabelText('Max: +∞')).toBeVisible();

  // Check that pearling works (i.e. that one thumb can push the other)
  await user.type(maxThumb, '{ArrowLeft}');
  expect(minInput).toHaveValue('3.12772e+2');
  expect(maxInput).toHaveValue('3.12772e+2');
  expect(minThumb).toHaveValue(80);
  expect(maxThumb).toHaveValue(80);

  // Ensure thumbs can be separated again
  await user.type(maxThumb, '{ArrowRight}');
  expect(maxInput).toHaveValue('3.71154e+2');
  expect(minThumb).toHaveValue(80);
  expect(maxThumb).toHaveValue(81);
});

test('handle min > max', async () => {
  await renderApp('/nexus/NXdata');

  await page.getByRole('button', { name: 'Edit domain' }).click();
  const minInput = page.getByLabelText('min', { exact: true });
  const maxInput = page.getByLabelText('max', { exact: true });

  await minInput.fill('500');
  await page.getByRole('button', { name: 'Apply min' }).click();
  expect(minInput).toHaveValue('5e+2');
  expect(maxInput).toHaveValue('4e+2');
  expect(page.getByText('Min greater than max')).toHaveTextContent(
    'falling back to data range',
  );

  expect(page.getByLabelText('Min: −9.5e+1')).toBeVisible();
  expect(page.getByLabelText('Max: 4e+2')).toBeVisible();

  // Autoscaling min hides the error
  await page.getByRole('button', { name: 'Min', exact: true }).click();
  expect(page.getByText('Min greater than max')).not.toBeInTheDocument();
});

test('handle min or max <= 0 in log scale', async () => {
  await renderApp('/nexus/image');

  // Ensure the scale type is log
  expect(page.getByRole('combobox', { name: 'Log' })).toBeVisible();

  const editBtn = page.getByRole('button', { name: 'Edit domain' });
  await editBtn.click();
  const minInput = page.getByLabelText('min', { exact: true });
  const maxInput = page.getByLabelText('max', { exact: true });

  await minInput.fill('-5');
  await page.getByRole('button', { name: 'Apply min' }).click();
  expect(minInput).toHaveValue('−5e+0');
  expect(page.getByText('Custom min invalid')).toHaveTextContent(
    'falling back to data min',
  );
  expect(page.getByLabelText('Max: 9.996e-1')).toBeVisible(); // data max

  // If min and max are negative and min > max, min > max error and fallback take over
  await maxInput.fill('-10');
  await page.getByRole('button', { name: 'Apply max' }).click();
  expect(page.getByText('Custom min invalid')).not.toBeInTheDocument();
  expect(page.getByText('Custom max invalid')).not.toBeInTheDocument();
  expect(page.getByText('Min greater than max')).toHaveTextContent(
    'falling back to data range',
  );
});

test('handle min <= 0 with custom max fallback in log scale', async () => {
  await renderApp('/nexus/image');

  // Ensure the scale type is log
  expect(page.getByRole('combobox', { name: 'Log' })).toBeVisible();

  await page.getByRole('button', { name: 'Edit domain' }).click();
  const minInput = page.getByLabelText('min', { exact: true });
  const maxInput = page.getByLabelText('max', { exact: true });

  await minInput.fill('-5');
  await page.getByRole('button', { name: 'Apply min' }).click();

  await maxInput.fill('1e-4'); // lower than data min
  await page.getByRole('button', { name: 'Apply max' }).click();

  expect(page.getByText('Custom min invalid')).toHaveTextContent(
    'falling back to custom max',
  );

  // Min fallback = custom max, so domain is empty
  expect(page.getByLabelText('Min: −∞')).toBeVisible();
  expect(page.getByLabelText('Max: +∞')).toBeVisible();
});
