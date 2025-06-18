import { DimensionMapper } from '@h5web/lib';
import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';

import FillHeight from './decorators/FillHeight';

const meta = {
  title: 'Building Blocks/DimensionMapper',
  component: DimensionMapper,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  args: {
    dimMapping: [],
    onChange: () => {},
  },
  argTypes: {
    dimMapping: { control: false },
  },
} satisfies Meta<typeof DimensionMapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
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
  },
} satisfies Story;

export const DimensionHints = {
  ...Default,
  args: {
    ...Default.args,
    dimHints: [undefined, 'Threshold', 'Position (mm)'],
  },
} satisfies Story;

export const FastSlicing = {
  ...Default,
  args: {
    ...Default.args,
    canSliceFast: () => true,
  },
} satisfies Story;

export const TwoAxes = {
  ...Default,
  args: {
    ...Default.args,
    dimMapping: ['x', 5, 'y'],
  },
} satisfies Story;

export const NoAxes = {
  ...Default,
  args: {
    ...Default.args,
    dimMapping: [0, 1, 2],
  },
} satisfies Story;

export const SmallDimensions = {
  ...Default,
  args: {
    dims: [1, 2, 3],
    dimMapping: [0, 0, 0],
  },
} satisfies Story;

export const LargeDimensions = {
  ...Default,
  args: {
    dims: [10_000, 100_000],
    dimMapping: [0, 99_999],
  },
} satisfies Story;

export const ExtraDimensions = {
  ...Default,
  args: {
    dims: [5, 10, 15, 20],
    dimMapping: [0, 'x'],
  },
} satisfies Story;
