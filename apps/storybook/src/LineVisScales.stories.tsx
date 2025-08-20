import { type LineVis, mockValues, ScaleType } from '@h5web/lib';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import LineVisStoriesMeta, { Default } from './LineVis.stories';

const xLog = mockValues.X_log(); // eslint-disable-line new-cap

const meta = {
  ...LineVisStoriesMeta,
  title: 'Visualizations/LineVis/Scales',
} satisfies Meta<typeof LineVis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SymLogForY = {
  ...Default,
  name: 'Symlog for Y',
  args: {
    scaleType: ScaleType.SymLog,
  },
} satisfies Story;

export const LogForY = {
  ...Default,
  name: 'Log for Y',
  args: {
    scaleType: ScaleType.Log,
  },
} satisfies Story;

export const SymLogForX = {
  ...Default,
  name: 'Symlog for X',
  args: {
    dataArray: xLog,
    scaleType: ScaleType.SymLog,
  },
} satisfies Story;

export const LogForX = {
  ...Default,
  name: 'Log for X',
  args: {
    dataArray: xLog,
    abscissaParams: { scaleType: ScaleType.Log },
  },
} satisfies Story;

export const LogLog = {
  ...Default,
  args: {
    dataArray: xLog,
    scaleType: ScaleType.Log,
    abscissaParams: { scaleType: ScaleType.Log },
  },
} satisfies Story;
