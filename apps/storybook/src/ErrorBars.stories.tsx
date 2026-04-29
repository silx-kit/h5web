import {
  DefaultInteractions,
  ErrorBars,
  mockValues,
  useDomain,
  VisCanvas,
} from '@h5web/lib';
import { assertDefined } from '@h5web/shared/guards';
import { ScaleType } from '@h5web/shared/vis-models';
import { range } from 'd3-array';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const oneD = mockValues.oneD();

const meta = preview.meta({
  title: 'Building Blocks/ErrorBars',
  component: ErrorBars,
  decorators: [FillHeight],
  argTypes: {
    abscissas: { control: false },
    ordinates: { control: false },
    errors: { control: false },
    color: { control: { type: 'color' } },
  },
});

export const Default = meta.story({
  render: (args) => {
    const { abscissas, ordinates, errors, ignoreValue } = args;

    const abscissaDomain = useDomain(abscissas);
    const ordinateDomain = useDomain(ordinates, {
      errors,
      scaleType: ScaleType.Log,
      ignoreValue,
    });

    assertDefined(abscissaDomain);
    assertDefined(ordinateDomain);

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: abscissaDomain, showGrid: true }}
        ordinateConfig={{
          visDomain: ordinateDomain,
          scaleType: ScaleType.Log,
          showGrid: true,
        }}
      >
        <DefaultInteractions />
        <ErrorBars {...args} />
      </VisCanvas>
    );
  },
  args: {
    abscissas: range(oneD.size),
    ordinates: oneD.data,
    errors: oneD.data.map(() => 10),
    color: 'blue',
  },
});

export const Color = Default.extend({
  args: {
    color: 'red',
  },
});

export const IgnoreValue = Default.extend({
  args: {
    ignoreValue: (val) => val % 5 === 0,
  },
});
