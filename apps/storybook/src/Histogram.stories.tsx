import { Histogram, ScaleType } from '@h5web/lib';
import { COLOR_SCALE_TYPES } from '@h5web/shared/vis-utils';
import { useState } from 'react';

import preview from '../.storybook/preview';

const meta = preview.meta({
  title: 'Toolbar/Histogram',
  component: Histogram,
  argTypes: {
    scaleType: {
      control: { type: 'inline-radio' },
      options: COLOR_SCALE_TYPES,
    },
    onChangeMin: { control: false },
    onChangeMax: { control: false },
  },
});

export const Default = meta.story({
  render: (args) => {
    const { value, ...otherArgs } = args;
    const [min, setMin] = useState(value[0]);
    const [max, setMax] = useState(value[1]);

    return (
      <>
        <p style={{ marginTop: 0 }}>
          Domain: [{min.toFixed(2)}, {max.toFixed(2)}]
        </p>
        <Histogram
          {...otherArgs}
          value={[min, max]}
          onChangeMin={setMin}
          onChangeMax={setMax}
        />
      </>
    );
  },
  args: {
    dataDomain: [4, 400],
    value: [10, 100],
    values: [130, 92, 76, 68, 60, 52, 50, 26],
    bins: [4, 53.5, 103, 152.5, 202, 251.5, 301, 350.5],
    scaleType: ScaleType.Linear,
  },
});

export const SmallDataDomain = Default.extend({
  args: {
    dataDomain: [100, 300],
  },
});

export const WithColorMap = Default.extend({
  args: {
    colorMap: 'Blues',
    invertColorMap: true,
  },
});

export const TypedValues = Default.extend({
  args: {
    values: new Int32Array([26, 50, 52, 60, 68, 76, 92, 130]),
    bins: new Float32Array([4, 53.5, 103, 152.5, 202, 251.5, 301, 350.5]),
  },
});

export const HideLeftAxis = Default.extend({
  args: {
    showLeftAxis: false,
  },
});

export const NonInteractive = meta.story({
  args: {
    ...Default.composed.args,
    onChangeMin: undefined, // explicitely set to `undefined`, as Storybook seems to register default event handlers
    onChangeMax: undefined, // explicitely set to `undefined`, as Storybook seems to register default event handlers
  },
});
