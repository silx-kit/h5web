import type { DataToWorldProps, Rect, SvgLineProps } from '@h5web/lib';
import {
  DefaultInteractions,
  SvgLine,
  VisCanvas,
  DataToWorld,
} from '@h5web/lib';
import type { Meta, Story } from '@storybook/react';
import { Vector3 } from 'three';

import FillHeight from './decorators/FillHeight';

const Template: Story<SvgLineProps> = (args) => (
  <VisCanvas
    abscissaConfig={{ visDomain: [0, 41], showGrid: true }}
    ordinateConfig={{ visDomain: [0, 20], showGrid: true }}
  >
    <DefaultInteractions />
    <SvgLine {...args} />
  </VisCanvas>
);

export const Default = Template.bind({});
Default.args = {
  coords: [new Vector3(-250, -100, 0), new Vector3(200, 150, 0)],
};

export const Custom = Template.bind({});
Custom.args = {
  coords: [new Vector3(-250, -100, 0), new Vector3(200, 150, 0)],
  stroke: 'teal',
  strokeWidth: 10,
  strokeDasharray: '40 20',
  strokeLinecap: 'round',
};

export const WithDataToWorld: Story<
  Omit<SvgLineProps, 'coords'> & DataToWorldProps<Rect>
> = (args) => {
  const { coords, ...lineProps } = args;
  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 41], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 20], showGrid: true }}
    >
      <DefaultInteractions />
      <DataToWorld coords={coords}>
        {(...worldCoords) => <SvgLine coords={worldCoords} {...lineProps} />}
      </DataToWorld>
    </VisCanvas>
  );
};

WithDataToWorld.storyName = 'With DataToWorld';
WithDataToWorld.args = {
  coords: [new Vector3(5, 15), new Vector3(30, 5)],
  strokeWidth: 2,
  stroke: 'orangered',
};

export default {
  title: 'Building Blocks/SVG/Line',
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
} as Meta;
