import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { pressKey, renderApp, selectExplorerNode } from '../../../test-utils';

test('show slider with two thumbs', async () => {
  renderApp(); // default NeXus group renders heatmap and therefore domain slider

  const thumbs = await screen.findAllByRole('slider');
  expect(thumbs).toHaveLength(2);
  expect(thumbs[0]).toHaveAttribute('aria-valuenow', '20');
  expect(thumbs[1]).toHaveAttribute('aria-valuenow', '81');
});

test('show tooltip on hover', async () => {
  renderApp();

  const editBtn = await screen.findByRole('button', { name: 'Edit domain' });
  const tooltip = screen.getByRole('dialog', { hidden: true });

  expect(editBtn).toHaveAttribute('aria-expanded', 'false');
  expect(tooltip).not.toBeVisible();

  userEvent.hover(editBtn);
  expect(editBtn).toHaveAttribute('aria-expanded', 'true');
  expect(tooltip).toBeVisible();

  userEvent.unhover(editBtn);
  expect(editBtn).toHaveAttribute('aria-expanded', 'false');
  expect(tooltip).not.toBeVisible();

  userEvent.hover(editBtn);
  userEvent.keyboard('{Escape}');
  expect(tooltip).not.toBeVisible();
});

test('show min/max and data range in tooltip', async () => {
  renderApp();

  const editBtn = await screen.findByRole('button', { name: 'Edit domain' });
  userEvent.hover(editBtn);

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
  renderApp();

  // Give focus to min thumb (and hover to reveal tooltip)
  const minThumb = await screen.findByRole('slider', { name: /min/ });
  userEvent.hover(minThumb);
  minThumb.focus();

  const visArea = screen.getByRole('figure');
  const minInput = screen.getByLabelText('min');
  const maxInput = screen.getByLabelText('max');

  // Move thumb one step to the left
  userEvent.keyboard('{ArrowLeft}');
  expect(minInput).toHaveValue('−1.04671e+2');
  expect(within(visArea).getByText('−1.047e+2')).toBeInTheDocument();

  // Move thumb five steps to the left (in a single press)
  pressKey('ArrowLeft', 5); // https://github.com/testing-library/user-event/issues/618
  expect(minInput).toHaveValue('−2.30818e+2');
  expect(within(visArea).getByText('−2.308e+2')).toBeInTheDocument();

  expect(minThumb).toHaveAttribute('aria-valuenow', '20'); // still at original position
  expect(maxInput).toHaveValue('4e+2'); // unaffected

  // Give focus to max thumb
  const maxThumb = await screen.findByRole('slider', { name: /max/ });
  maxThumb.focus();

  // Jump ten steps to the left
  userEvent.keyboard('{PageDown}');
  expect(maxInput).toHaveValue('5.72182e+1');
  expect(within(visArea).getByText('5.722e+1')).toBeInTheDocument();

  // Jump ten steps to the right
  userEvent.keyboard('{PageUp}');
  expect(maxInput).toHaveValue('2.52142e+2'); // not back to 4e+2 because of domain extension behaviour
  expect(within(visArea).getByText('2.521e+2')).toBeInTheDocument();

  expect(maxThumb).toHaveAttribute('aria-valuenow', '81'); // still at original position
  expect(minInput).toHaveValue('−2.30818e+2'); // unaffected

  // Remove focus now to avoid state update after unmount
  maxThumb.blur();
});

test('allow editing bounds manually', async () => {
  renderApp();

  const visArea = await screen.findByRole('figure');
  const editBtn = screen.getByRole('button', { name: 'Edit domain' });
  expect(editBtn).toHaveAttribute('aria-pressed', 'false');

  // Open tooltip with both min and max in edit mode
  userEvent.click(editBtn);
  expect(editBtn).toHaveAttribute('aria-pressed', 'true');
  expect(editBtn).toHaveAttribute('aria-expanded', 'true');

  const minInput = screen.getByLabelText('min');
  const maxInput = screen.getByLabelText('max');
  const applyBtn = screen.getByRole('button', { name: 'Apply min' });
  const cancelBtn = screen.getByRole('button', { name: 'Cancel min' });
  expect(minInput).toHaveFocus();
  expect(applyBtn).toBeEnabled();
  expect(cancelBtn).toBeEnabled();

  // Type '1' in min input field (at the end, after the current value)
  userEvent.type(minInput, '1');
  expect(minInput).toHaveValue('−9.5e+11');
  expect(within(visArea).getByText('−9.5e+1')).toBeInTheDocument(); // not applied yet

  // Cancel min edit
  userEvent.click(cancelBtn);
  expect(minInput).toHaveValue('−9.5e+1');
  expect(applyBtn).toBeDisabled();
  expect(cancelBtn).toBeDisabled();

  // Turn min editing back on, type '1' again and apply new min
  userEvent.type(minInput, '1');
  userEvent.click(applyBtn);
  expect(within(visArea).getByText('−9.5e+11')).toBeInTheDocument(); // applied
  expect(editBtn).toHaveAttribute('aria-pressed', 'true'); // because max still in edit mode

  // Replace value of max input field and apply new max with Enter
  userEvent.clear(maxInput);
  userEvent.type(maxInput, '100000{enter}');

  expect(maxInput).toHaveValue('1e+5'); // auto-format
  expect(within(visArea).getByText('1e+5')).toBeInTheDocument();
  expect(editBtn).toHaveAttribute('aria-pressed', 'false'); // min and max no longer in edit mode
});

test('clamp domain in symlog scale', async () => {
  renderApp();

  const editBtn = await screen.findByRole('button', { name: 'Edit domain' });
  userEvent.click(editBtn);

  const minThumb = screen.getByRole('slider', { name: /min/ });
  const maxThumb = screen.getByRole('slider', { name: /max/ });
  const minInput = screen.getByLabelText('min');
  const maxInput = screen.getByLabelText('max');

  userEvent.clear(minInput);
  userEvent.type(minInput, '-1e+1000{enter}');
  expect(minInput).toHaveValue('−8.98847e+307');
  expect(minThumb).toHaveAttribute('aria-valuenow', '1');

  userEvent.clear(maxInput);
  userEvent.type(maxInput, '1e+1000{enter}');
  expect(maxInput).toHaveValue('8.98847e+307');
  expect(maxThumb).toHaveAttribute('aria-valuenow', '100');

  maxThumb.focus();
  userEvent.keyboard('{ArrowLeft}');
  expect(maxInput).toHaveValue('5.40006e+301');
  expect(maxThumb).toHaveAttribute('aria-valuenow', '99'); // does not jump back to 81

  // Remove focus now to avoid state update after unmount
  maxThumb.blur();
});

test('show min/max autoscale toggles in tooltip (pressed by default)', async () => {
  renderApp();

  const editBtn = await screen.findByRole('button', { name: 'Edit domain' });
  userEvent.hover(editBtn);

  expect(screen.getByText('Autoscale')).toBeVisible();

  const minBtn = screen.getByRole('button', { name: 'Min' });
  const maxBtn = screen.getByRole('button', { name: 'Max' });
  expect(minBtn).toHaveAttribute('aria-pressed', 'true');
  expect(maxBtn).toHaveAttribute('aria-pressed', 'true');
});

test('control min/max autoscale behaviour', async () => {
  renderApp();

  const minThumb = await screen.findByRole('slider', { name: /min/ });
  userEvent.hover(minThumb);

  const minBtn = screen.getByRole('button', { name: 'Min' });
  const maxBtn = screen.getByRole('button', { name: 'Max' });
  const maxInput = screen.getByLabelText('max');

  // Moving min thumb disables min autoscale
  minThumb.focus();
  userEvent.keyboard('{ArrowRight}');
  expect(minBtn).toHaveAttribute('aria-pressed', 'false');
  expect(maxBtn).toHaveAttribute('aria-pressed', 'true'); // unaffected

  // Editing max disables max autoscale
  userEvent.type(maxInput, '0{enter}');
  expect(maxInput).toHaveValue('4e+20');
  expect(maxBtn).toHaveAttribute('aria-pressed', 'false');

  // Re-enable max autoscale
  userEvent.click(maxBtn);
  expect(maxInput).toHaveValue('4e+2');
  expect(maxBtn).toHaveAttribute('aria-pressed', 'true');
  expect(minBtn).toHaveAttribute('aria-pressed', 'false'); // unaffected
});

test('handle empty domain', async () => {
  renderApp();

  const visArea = await screen.findByRole('figure');
  const editBtn = screen.getByRole('button', { name: 'Edit domain' });
  userEvent.click(editBtn);

  const minInput = screen.getByLabelText('min');
  const maxInput = screen.getByLabelText('max');
  const minThumb = screen.getByRole('slider', { name: /min/ });
  const maxThumb = screen.getByRole('slider', { name: /max/ });

  // Give min the same value as max
  userEvent.clear(minInput);
  userEvent.type(minInput, '400{enter}');
  expect(minThumb).toHaveAttribute('aria-valuenow', '58'); // not quite in the middle because of symlog
  expect(maxThumb).toHaveAttribute('aria-valuenow', '58');
  expect(within(visArea).getByText('−∞')).toBeInTheDocument();
  expect(within(visArea).getByText('+∞')).toBeInTheDocument();

  // Check that pearling works (i.e. that one thumb can push the other)
  maxThumb.focus();
  userEvent.keyboard('{ArrowLeft}');
  expect(minInput).toHaveValue('3.97453e+2');
  expect(maxInput).toHaveValue('3.97453e+2');
  expect(minThumb).toHaveAttribute('aria-valuenow', '58'); // thumbs stay in the middle
  expect(maxThumb).toHaveAttribute('aria-valuenow', '58');

  // Ensure thumbs can be separated again
  userEvent.keyboard('{ArrowRight}');
  expect(maxInput).toHaveValue('3.99891e+2');
  expect(minThumb).toHaveAttribute('aria-valuenow', '20');
  expect(maxThumb).toHaveAttribute('aria-valuenow', '81');

  // Remove focus now to avoid state update after unmount
  maxThumb.blur();
});

test('handle min > max', async () => {
  renderApp();

  const visArea = await screen.findByRole('figure');
  const editBtn = screen.getByRole('button', { name: 'Edit domain' });
  userEvent.click(editBtn);

  const minInput = screen.getByLabelText('min');
  const maxInput = screen.getByLabelText('max');

  userEvent.clear(minInput);
  userEvent.type(minInput, '500{enter}');
  expect(minInput).toHaveValue('5e+2');
  expect(maxInput).toHaveValue('4e+2');
  expect(screen.getByText(/Min greater than max/)).toHaveTextContent(
    /falling back to data range/
  );

  expect(within(visArea).getByText('−9.5e+1')).toBeInTheDocument();
  expect(within(visArea).getByText('4e+2')).toBeInTheDocument();

  // Autoscaling min hides the error
  const minBtn = screen.getByRole('button', { name: 'Min' });
  userEvent.click(minBtn);
  expect(screen.queryByText(/Min greater than max/)).not.toBeInTheDocument();
});

test('handle min or max <= 0 in log scale', async () => {
  renderApp();
  await selectExplorerNode('nexus_entry/image');
  await screen.findByRole('button', { name: 'Log' }); // wait for switch to log scale

  const visArea = await screen.findByRole('figure');
  const editBtn = screen.getByRole('button', { name: 'Edit domain' });
  userEvent.click(editBtn);

  const minInput = screen.getByLabelText('min');
  const maxInput = screen.getByLabelText('max');

  userEvent.clear(minInput);
  userEvent.type(minInput, '-5{enter}');
  expect(minInput).toHaveValue('−5e+0');
  expect(screen.getByText(/Custom min invalid/)).toHaveTextContent(
    /falling back to data min/
  );

  expect(within(visArea).getByText('9.996e-1')).toBeInTheDocument(); // data max

  // If min and max are negative and min > max, min > max error and fallback take over
  userEvent.clear(maxInput);
  userEvent.type(maxInput, '-10{enter}');
  expect(screen.queryByText(/Custom min invalid/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Custom max invalid/)).not.toBeInTheDocument();
  expect(screen.getByText(/Min greater than max/)).toHaveTextContent(
    /falling back to data range/
  );
});

test('handle min <= 0 with custom max fallback in log scale', async () => {
  renderApp();
  await selectExplorerNode('nexus_entry/image');
  await screen.findByRole('button', { name: 'Log' }); // wait for switch to log scale

  const visArea = await screen.findByRole('figure');
  const editBtn = screen.getByRole('button', { name: 'Edit domain' });
  userEvent.click(editBtn);

  const minInput = screen.getByLabelText('min');
  const maxInput = screen.getByLabelText('max');

  userEvent.clear(minInput);
  userEvent.type(minInput, '-5{enter}');

  userEvent.clear(maxInput);
  userEvent.type(maxInput, '1e-4{enter}'); // lower than data min

  expect(screen.getByText(/Custom min invalid/)).toHaveTextContent(
    /falling back to custom max/
  );

  // Min fallback = custom max, so domain is empty
  expect(within(visArea).getByText('−∞')).toBeInTheDocument();
  expect(within(visArea).getByText('+∞')).toBeInTheDocument();
});
