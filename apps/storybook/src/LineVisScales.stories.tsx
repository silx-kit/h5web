import type { LineVis } from '@h5web/lib';
import { mockValues, ScaleType } from '@h5web/lib';
import type { Meta, StoryObj } from '@storybook/react';

import LineVisStoriesMeta, { Default } from './LineVis.stories';

const dataArrayForXLog = mockValues.X_log(); // eslint-disable-line new-cap

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
    dataArray: dataArrayForXLog,
    scaleType: ScaleType.SymLog,
  },
} satisfies Story;

export const LogForX = {
  ...Default,
  name: 'Log for X',
  args: {
    dataArray: dataArrayForXLog,
    abscissaParams: { scaleType: ScaleType.Log },
  },
} satisfies Story;

export const LogLog = {
  ...Default,
  args: {
    dataArray: dataArrayForXLog,
    scaleType: ScaleType.Log,
    abscissaParams: { scaleType: ScaleType.Log },
  },
} satisfies Story;
