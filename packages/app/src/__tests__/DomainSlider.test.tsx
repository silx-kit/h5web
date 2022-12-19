import { screen, waitFor, within } from '@testing-library/react';

import { renderApp } from '../test-utils';

test('show slider with two thumbs', async () => {
  await renderApp('/nexus_entry/nx_process/nx_data');

  const thumbs = await screen.findAllByRole('slider');
  expect(thumbs).toHaveLength(2);
  expect(thumbs[0]).toHaveAttribute('aria-valuenow', '20');
  expect(thumbs[1]).toHaveAttribute('aria-valuenow', '81');
});

test('show tooltip on hover', async () => {
  const { user } = await renderApp('/nexus_entry/nx_process/nx_data');

  const editBtn = await screen.findByRole('button', { name: 'Edit domain' });
  const tooltip = screen.getByRole('dialog', { hidden: true });

  expect(editBtn).toHaveAttribute('aria-expanded', 'false');
  expect(tooltip).not.toBeVisible();

  await user.hover(editBtn);
  expect(editBtn).toHaveAttribute('aria-expanded', 'true');
  expect(tooltip).toBeVisible();

  await user.unhover(editBtn);
  expect(editBtn).toHaveAttribute('aria-expanded', 'false');
  expect(tooltip).not.toBeVisible();

  await user.hover(editBtn);
  await user.keyboard('{Escape}');
  expect(tooltip).not.toBeVisible();
});

test('show min/max and data range in tooltip', async () => {
  const { user } = await renderApp('/nexus_entry/nx_process/nx_data');

  const editBtn = await screen.findByRole('button', { name: 'Edit domain' });
  await user.hover(editBtn);

  const minInput = screen.getByLabelText('min');
  const maxInput = screen.getByLabelText('max');
  expect(minInput).toHaveValue('−9.5e+1');
  expect(maxInput).toHaveValue('4e+2');
  expect(minInput).toHaveAttribute('title', '-95');
  expect(maxInput).toHaveAttribute('title', '400');

  const range = screen.getByText(/Data range/);
  expect(range).toBeVisible();
  expect(within(range).getByTitle('-95')).toHaveTextContent('−9.5e+1');
  expect(within(range).getByTitle('400')).toHaveTextContent('4e+2');
});

test('update domain when moving thumbs (with keyboard)', async () => {
  const { user } = await renderApp('/nexus_entry/nx_process/nx_data');

  // Hover min thumb to reveal tooltip
  const minThumb = await screen.findByRole('slider', { name: /min/ });
  await user.hover(minThumb);

  const visArea = await screen.findByRole('figure');
  const minInput = screen.getByLabelText('min');
  const maxInput = screen.getByLabelText('max');

  // Move min thumb one step to the left with keyboard
  await user.type(minThumb, '{ArrowLeft}');
  expect(minInput).toHaveValue('−1.04671e+2');
  expect(within(visArea).getByText('−1.047e+2')).toBeVisible();

  // Move min thumb five steps to the left (in a single press)
  await user.type(minThumb, '{ArrowLeft>5/}'); // press key and hold for 5 keydown events, then release
  expect(minInput).toHaveValue('−2.30818e+2');
  expect(within(visArea).getByText('−2.308e+2')).toBeVisible();

  expect(minThumb).toHaveAttribute('aria-valuenow', '20'); // still at original position
  expect(maxInput).toHaveValue('4e+2'); // unaffected

  // Move max thumb ten steps to the left
  const maxThumb = await screen.findByRole('slider', { name: /max/ });
  await user.type(maxThumb, '{PageDown}');
  expect(maxInput).toHaveValue('5.72182e+1');
  expect(within(visArea).getByText('5.722e+1')).toBeVisible();

  // Move max thumb ten steps to the right
  await user.type(maxThumb, '{PageUp}');
  expect(maxInput).toHaveValue('3.68841e+2'); // not back to 4e+2 because 4e+2 is not exactly on a slider division
  expect(within(visArea).getByText('3.688e+2')).toBeVisible();

  expect(maxThumb).toHaveAttribute('aria-valuenow', '81'); // still at original position
  expect(minInput).toHaveValue('−2.30818e+2'); // unaffected

  // Remove focus now to avoid state update after unmount
  maxThumb.blur();
});

test('edit bounds manually', async () => {
  const { user } = await renderApp('/nexus_entry/nx_process/nx_data');

  const editBtn = await screen.findByRole('button', { name: 'Edit domain' });
  expect(editBtn).toHaveAttribute('aria-pressed', 'false');

  // Click on edit button to open tooltip with both min and max in edit mode
  await user.click(editBtn);
  expect(editBtn).toHaveAttribute('aria-pressed', 'true');
  expect(editBtn).toHaveAttribute('aria-expanded', 'true');

  const minInput = screen.getByLabelText('min');
  const maxInput = screen.getByLabelText('max');
  const applyMinBtn = screen.getByRole('button', { name: 'Apply min' });
  const cancelMinBtn = screen.getByRole('button', { name: 'Cancel min' });
  expect(applyMinBtn).toBeEnabled();
  expect(cancelMinBtn).toBeEnabled();
  await waitFor(() => expect(minInput).toHaveFocus()); // input needs time to receive focus

  // Type '1' in min input field (at the end, after the current value)
  await user.type(minInput, '1');
  expect(minInput).toHaveValue('−9.5e+11');

  const visArea = await screen.findByRole('figure');
  expect(within(visArea).getByText('−9.5e+1')).toBeVisible(); // not applied yet

  // Cancel min edit
  await user.click(cancelMinBtn);
  expect(minInput).toHaveValue('−9.5e+1');
  expect(applyMinBtn).toBeDisabled();
  expect(cancelMinBtn).toBeDisabled();

  // Turn min editing back on, type '1' again and apply new min
  await user.type(minInput, '1');
  await user.click(applyMinBtn);
  expect(within(visArea).getByText('−9.5e+11')).toBeVisible(); // applied
  expect(editBtn).toHaveAttribute('aria-pressed', 'true'); // because max still in edit mode

  // Replace value of max input field and apply new max with Enter
  await user.clear(maxInput);
  await user.type(maxInput, '100000{enter}');

  expect(maxInput).toHaveValue('1e+5'); // auto-format
  expect(within(visArea).getByText('1e+5')).toBeVisible();
  expect(editBtn).toHaveAttribute('aria-pressed', 'false'); // min and max no longer in edit mode
});

test('clamp domain in symlog scale', async () => {
  const { user } = await renderApp('/nexus_entry/nx_process/nx_data');

  await user.click(await screen.findByRole('button', { name: 'Edit domain' }));
  const minThumb = screen.getByRole('slider', { name: /min/ });
  const maxThumb = screen.getByRole('slider', { name: /max/ });
  const minInput = screen.getByLabelText('min');
  const maxInput = screen.getByLabelText('max');

  await user.clear(minInput);
  await user.type(minInput, '-1e+1000{enter}');
  expect(minInput).toHaveValue('−8.98847e+307');
  expect(minThumb).toHaveAttribute('aria-valuenow', '1');

  await user.clear(maxInput);
  await user.type(maxInput, '1e+1000{enter}');
  expect(maxInput).toHaveValue('8.98847e+307');
  expect(maxThumb).toHaveAttribute('aria-valuenow', '100');

  await user.type(maxThumb, '{ArrowLeft}');
  expect(maxInput).toHaveValue('5.40006e+301');
  expect(maxThumb).toHaveAttribute('aria-valuenow', '99'); // does not jump back to 81

  // Remove focus now to avoid state update after unmount
  maxThumb.blur();
});

test('control min/max autoscale behaviour', async () => {
  const { user } = await renderApp('/nexus_entry/nx_process/nx_data');

  const minThumb = await screen.findByRole('slider', { name: /min/ });
  await user.hover(minThumb);

  const minBtn = screen.getByRole('button', { name: 'Min' });
  const maxBtn = screen.getByRole('button', { name: 'Max' });
  const maxInput = screen.getByLabelText('max');

  // Autoscale is enabled for both min and max by default
  expect(minBtn).toHaveAttribute('aria-pressed', 'true');
  expect(maxBtn).toHaveAttribute('aria-pressed', 'true');

  // Moving min thumb disables min autoscale
  await user.type(minThumb, '{ArrowRight}');
  expect(minBtn).toHaveAttribute('aria-pressed', 'false');
  expect(maxBtn).toHaveAttribute('aria-pressed', 'true'); // unaffected

  // Editing max disables max autoscale
  await user.type(maxInput, '0{enter}');
  expect(maxInput).toHaveValue('4e+20');
  expect(maxBtn).toHaveAttribute('aria-pressed', 'false');

  // Re-enable max autoscale
  await user.click(maxBtn);
  expect(maxBtn).toHaveAttribute('aria-pressed', 'true');
  expect(minBtn).toHaveAttribute('aria-pressed', 'false'); // unaffected
  await waitFor(() => expect(maxInput).toHaveValue('4e+2')); // input needs time to be reset
});

test('handle empty domain', async () => {
  const { user } = await renderApp('/nexus_entry/nx_process/nx_data');

  await user.click(await screen.findByRole('button', { name: 'Edit domain' }));
  const minInput = screen.getByLabelText('min');
  const maxInput = screen.getByLabelText('max');
  const minThumb = screen.getByRole('slider', { name: /min/ });
  const maxThumb = screen.getByRole('slider', { name: /max/ });

  // Give min the same value as max
  await user.clear(minInput);
  await user.type(minInput, '400{enter}');
  expect(minThumb).toHaveAttribute('aria-valuenow', '81');
  expect(maxThumb).toHaveAttribute('aria-valuenow', '81');

  const visArea = await screen.findByRole('figure');
  expect(within(visArea).getByText('−∞')).toBeVisible();
  expect(within(visArea).getByText('+∞')).toBeVisible();

  // Check that pearling works (i.e. that one thumb can push the other)
  await user.type(maxThumb, '{ArrowLeft}');
  expect(minInput).toHaveValue('3.12772e+2');
  expect(maxInput).toHaveValue('3.12772e+2');
  expect(minThumb).toHaveAttribute('aria-valuenow', '80');
  expect(maxThumb).toHaveAttribute('aria-valuenow', '80');

  // Ensure thumbs can be separated again
  await user.type(maxThumb, '{ArrowRight}');
  expect(maxInput).toHaveValue('3.71154e+2');
  expect(minThumb).toHaveAttribute('aria-valuenow', '80');
  expect(maxThumb).toHaveAttribute('aria-valuenow', '81');

  // Remove focus now to avoid state update after unmount
  maxThumb.blur();
});

test('handle min > max', async () => {
  const { user } = await renderApp('/nexus_entry/nx_process/nx_data');

  await user.click(await screen.findByRole('button', { name: 'Edit domain' }));
  const minInput = screen.getByLabelText('min');
  const maxInput = screen.getByLabelText('max');

  await user.clear(minInput);
  await user.type(minInput, '500{enter}');
  expect(minInput).toHaveValue('5e+2');
  expect(maxInput).toHaveValue('4e+2');
  expect(screen.getByText(/Min greater than max/)).toHaveTextContent(
    /falling back to data range/
  );

  const visArea = await screen.findByRole('figure');
  expect(within(visArea).getByText('−9.5e+1')).toBeVisible();
  expect(within(visArea).getByText('4e+2')).toBeVisible();

  // Autoscaling min hides the error
  await user.click(screen.getByRole('button', { name: 'Min' }));
  expect(screen.queryByText(/Min greater than max/)).not.toBeInTheDocument();
});

test('handle min or max <= 0 in log scale', async () => {
  const { user } = await renderApp('/nexus_entry/image');

  await expect(
    screen.findByRole('button', { name: 'Log' }) // wait for switch to log scale
  ).resolves.toBeVisible();

  const editBtn = screen.getByRole('button', { name: 'Edit domain' });
  await user.click(editBtn);
  const minInput = screen.getByLabelText('min');
  const maxInput = screen.getByLabelText('max');

  await user.clear(minInput);
  await user.type(minInput, '-5{enter}');
  expect(minInput).toHaveValue('−5e+0');
  expect(screen.getByText(/Custom min invalid/)).toHaveTextContent(
    /falling back to data min/
  );

  const visArea = await screen.findByRole('figure');
  expect(within(visArea).getByText('9.996e-1')).toBeVisible(); // data max

  // If min and max are negative and min > max, min > max error and fallback take over
  await user.clear(maxInput);
  await user.type(maxInput, '-10{enter}');
  expect(screen.queryByText(/Custom min invalid/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Custom max invalid/)).not.toBeInTheDocument();
  expect(screen.getByText(/Min greater than max/)).toHaveTextContent(
    /falling back to data range/
  );
});

test('handle min <= 0 with custom max fallback in log scale', async () => {
  const { user } = await renderApp('/nexus_entry/image');

  // Ensure the scale type is log
  await expect(
    screen.findByRole('button', { name: 'Log' })
  ).resolves.toBeVisible();

  await user.click(screen.getByRole('button', { name: 'Edit domain' }));
  const minInput = screen.getByLabelText('min');
  const maxInput = screen.getByLabelText('max');

  await user.clear(minInput);
  await user.type(minInput, '-5{enter}');

  await user.clear(maxInput);
  await user.type(maxInput, '1e-4{enter}'); // lower than data min

  expect(screen.getByText(/Custom min invalid/)).toHaveTextContent(
    /falling back to custom max/
  );

  // Min fallback = custom max, so domain is empty
  const visArea = await screen.findByRole('figure');
  expect(within(visArea).getByText('−∞')).toBeVisible();
  expect(within(visArea).getByText('+∞')).toBeVisible();
});
