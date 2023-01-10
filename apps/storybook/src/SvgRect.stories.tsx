import type { DataToWorldProps, Rect, SvgRectProps } from '@h5web/lib';
import {
  DefaultInteractions,
  SvgRect,
  VisCanvas,
  DataToWorld,
} from '@h5web/lib';
import type { Meta, Story } from '@storybook/react';
import { Vector3 } from 'three';

import FillHeight from './decorators/FillHeight';

const Template: Story<SvgRectProps> = (args) => (
  <VisCanvas
    abscissaConfig={{ visDomain: [0, 41], showGrid: true }}
    ordinateConfig={{ visDomain: [0, 20], showGrid: true }}
  >
    <DefaultInteractions />
    <SvgRect {...args} />
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
  strokeWidth: 5,
  fill: 'teal',
  fillOpacity: 0.6,
};

export const WithDataToWorld: Story<
  Omit<SvgRectProps, 'coords'> & DataToWorldProps<Rect>
> = (args) => {
  const { coords, ...lineProps } = args;
  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 41], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 20], showGrid: true }}
    >
      <DefaultInteractions />
      <DataToWorld coords={coords}>
        {(...worldCoords) => <SvgRect coords={worldCoords} {...lineProps} />}
      </DataToWorld>
    </VisCanvas>
  );
};

WithDataToWorld.storyName = 'With DataToWorld';
WithDataToWorld.args = {
  coords: [new Vector3(5, 15), new Vector3(20, 10)],
  fill: 'orangered',
  fillOpacity: 0.6,
};

export default {
  title: 'Building Blocks/SVG/Rect',
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
} as Meta;
