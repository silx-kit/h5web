import { DimensionMapper } from '@h5web/lib';
import { useState } from 'react';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const meta = preview.meta({
  title: 'Building Blocks/DimensionMapper',
  component: DimensionMapper,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    dimMapping: { control: false },
  },
});

export const Default = meta.story({
  render: (args) => {
    const { dimMapping: initialMapping, ...otherArgs } = args;
    const [dimMapping, setDimMapping] = useState(initialMapping);

    return (
      <div style={{ display: 'flex' }}>
        <DimensionMapper
          {...otherArgs}
          dimMapping={dimMapping}
          onChange={setDimMapping}
        />
        <pre style={{ padding: '0 1rem', fontSize: '125%' }}>
          {JSON.stringify(dimMapping)}
        </pre>
      </div>
    );
  },
  args: {
    dims: [5, 10, 15],
    dimMapping: [2, 5, 'x'],
    onChange: () => {},
  },
});

export const DimensionHints = Default.extend({
  args: {
    dimHints: [undefined, 'Threshold', 'Position (mm)'],
  },
});

export const FastSlicing = Default.extend({
  args: {
    canSliceFast: () => true,
  },
});

export const TwoAxes = Default.extend({
  args: {
    dimMapping: ['x', 5, 'y'],
  },
});

export const NoAxes = Default.extend({
  args: {
    dimMapping: [0, 1, 2],
  },
});

export const SmallDimensions = Default.extend({
  args: {
    dims: [1, 2, 3],
    dimMapping: [0, 0, 0],
  },
});

export const LargeDimensions = Default.extend({
  args: {
    dims: [10_000, 100_000],
    dimMapping: [0, 99_999],
  },
});

export const LockedDimensions = Default.extend({
  args: {
    dims: [5, 10, 15, 20],
    dimMapping: [0, 'x', null, null],
  },
});
