import type { DataCurveProps } from '@h5web/lib';
import { CurveType, DataCurve, useDomain, VisCanvas } from '@h5web/lib';
import { assertDefined, mockValues } from '@h5web/shared';
import type { Meta, Story } from '@storybook/react/types-6-0';
import { range } from 'lodash';

import FillHeight from './decorators/FillHeight';

const Template: Story<DataCurveProps> = (args) => {
  const { abscissas, ordinates } = args;

  const abscissaDomain = useDomain(abscissas);
  const ordinateDomain = useDomain(ordinates);
  assertDefined(abscissaDomain);
  assertDefined(ordinateDomain);

  return (
    <VisCanvas
      abscissaConfig={{ visDomain: abscissaDomain, showGrid: true }}
      ordinateConfig={{ visDomain: ordinateDomain, showGrid: true }}
    >
      <DataCurve {...args} />
    </VisCanvas>
  );
};

export const Default = Template.bind({});
Default.args = {
  abscissas: range(0, mockValues.oneD.length),
  ordinates: mockValues.oneD,
  color: 'green',
};
Default.argTypes = {
  showErrors: { control: false },
};

export const Glyphs = Template.bind({});
Glyphs.args = {
  abscissas: range(0, mockValues.oneD.length),
  ordinates: mockValues.oneD,
  color: 'black',
  curveType: CurveType.GlyphsOnly,
};
Glyphs.argTypes = {
  showErrors: { control: false },
};

export const WithErrors = Template.bind({});
WithErrors.args = {
  abscissas: range(0, mockValues.oneD.length),
  ordinates: mockValues.oneD,
  errors: mockValues.oneD_errors,
  showErrors: true,
  color: 'blue',
};

export default {
  title: 'Building Blocks/DataCurve',
  component: DataCurve,
  decorators: [FillHeight],
  parameters: {
    layout: 'fullscreen',
    controls: {
      sort: 'requiredFirst',
      exclude: ['abscissas', 'ordinates', 'errors'],
    },
  },
  args: {
    curveType: CurveType.LineOnly,
    visible: true,
  },
} as Meta;
