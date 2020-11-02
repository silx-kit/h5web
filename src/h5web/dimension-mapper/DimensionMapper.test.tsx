import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { renderApp } from '../test-utils';

describe('DimensionMapper', () => {
  test('display mapping for X axis when visualizing 2D dataset as Line', async () => {
    renderApp();

    // Select the 2D dataset nD_datasets/twoD
    fireEvent.click(
      await screen.findByRole('treeitem', { name: 'nD_datasets' })
    );
    fireEvent.click(screen.getByRole('treeitem', { name: 'twoD' }));

    // Select the line vis
    fireEvent.click(await screen.findByRole('tab', { name: 'Line' }));

    // Ensure that the dimension mapper is only visible for X (and not for Y)
    const xRadioGroup = screen.getByLabelText('Dimension as x axis');
    expect(xRadioGroup).toBeVisible();
    const xDimsButtons = within(xRadioGroup).getAllByRole('radio');
    expect(xDimsButtons).toHaveLength(2);
    const yRadioGroup = screen.queryByLabelText('Dimension as y axis');
    expect(yRadioGroup).not.toBeInTheDocument();

    // Ensure that the default mapping is [0, 'x']
    expect(xDimsButtons[0]).not.toBeChecked();
    expect(xDimsButtons[1]).toBeChecked();
    const D0Slider = screen.getByRole('slider');
    expect(D0Slider).toHaveAttribute('aria-valueNow', '0');

    // Ensure that the swap from [0, 'x'] to ['x', 0] works
    fireEvent.click(xDimsButtons[0]);

    await waitFor(() => {
      expect(xDimsButtons[0]).toBeChecked();
      expect(xDimsButtons[1]).not.toBeChecked();
      const D1Slider = screen.getByRole('slider');
      expect(D1Slider).toHaveAttribute('aria-valueNow', '0');
    });
  });

  test('display mappings for X and Y axes when visualizing 2D dataset as Heatmap', async () => {
    renderApp();

    // Select the 2D dataset nD_datasets/twoD
    fireEvent.click(
      await screen.findByRole('treeitem', { name: 'nD_datasets' })
    );
    fireEvent.click(screen.getByRole('treeitem', { name: 'twoD' }));

    // Ensure that the heatmap vis is selected
    const heatmapTab = await screen.findByRole('tab', { name: 'Heatmap' });
    expect(heatmapTab).toHaveAttribute('aria-selected', 'true');

    // Ensure that the dimension mapper is visible for X and Y
    const xRadioGroup = screen.getByLabelText('Dimension as x axis');
    expect(xRadioGroup).toBeVisible();
    const yRadioGroup = screen.getByLabelText('Dimension as y axis');
    expect(yRadioGroup).toBeVisible();

    // Ensure that the default mapping is ['y', 'x']
    const xD1Button = within(xRadioGroup).getByRole('radio', { name: 'D1' });
    expect(xD1Button).toBeChecked();
    const yD0Button = within(yRadioGroup).getByRole('radio', { name: 'D0' });
    expect(yD0Button).toBeChecked();

    // Ensure that the swap from ['y', 'x'] to ['x', 'y'] works
    const xD0Button = within(xRadioGroup).getByRole('radio', { name: 'D0' });
    fireEvent.click(xD0Button);
    expect(xD0Button).toBeChecked();
    expect(xD1Button).not.toBeChecked();

    const yD1Button = within(yRadioGroup).getByRole('radio', { name: 'D1' });
    expect(yD0Button).not.toBeChecked();
    expect(yD1Button).toBeChecked();
  });

  test('display one dimension slider and mappings for X and Y axes when visualizing 3D dataset as Matrix', async () => {
    renderApp();

    // Select the 3D dataset nD_datasets/threeD
    fireEvent.click(
      await screen.findByRole('treeitem', { name: 'nD_datasets' })
    );
    fireEvent.click(screen.getByRole('treeitem', { name: 'threeD' }));

    // Select the matrix vis
    fireEvent.click(await screen.findByRole('tab', { name: 'Matrix' }));

    // Ensure that the dimension mapper is visible for X and Y
    const xRadioGroup = await screen.findByLabelText('Dimension as x axis');
    expect(xRadioGroup).toBeVisible();
    const xDimsButtons = within(xRadioGroup).getAllByRole('radio');
    expect(xDimsButtons).toHaveLength(3);

    const yRadioGroup = screen.getByLabelText('Dimension as y axis');
    expect(yRadioGroup).toBeVisible();
    const yDimsButtons = within(yRadioGroup).getAllByRole('radio');
    expect(yDimsButtons).toHaveLength(3);

    // Ensure that the default mapping is [0, 'y', 'x']
    expect(xDimsButtons[2]).toBeChecked();
    expect(yDimsButtons[1]).toBeChecked();
    const D0Slider = screen.getByRole('slider');
    expect(D0Slider).toHaveAttribute('aria-valueNow', '0');
  });
});
