import type { AxisConfig } from '@h5web/lib';
import {
  Annotation,
  Pan,
  ResetZoomButton,
  VisCanvas,
  VisGroup,
  Zoom,
} from '@h5web/lib';
import type { Meta, Story } from '@storybook/react/types-6-0';

import FillHeight from './decorators/FillHeight';

interface VisGroupStoryProps {
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
}

const Template: Story<VisGroupStoryProps> = (args) => {
  const points = [
    { x: 10, y: 10 },
    { x: 30, y: 10 },
    { x: 30, y: 30 },
    { x: 10, y: 30 },
  ];
  return (
    <VisCanvas {...args}>
      <Pan />
      <Zoom />
      <ResetZoomButton />
      <VisGroup>
        <mesh position={[20, 20, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial color="rgb(255, 0, 0)" />
        </mesh>
      </VisGroup>
      {points.map((pt) => (
        <Annotation key={`${pt.x},${pt.y}`} center x={pt.x} y={pt.y}>
          ({pt.x}, {pt.y})
        </Annotation>
      ))}
    </VisCanvas>
  );
};

export const Default = Template.bind({});
Default.args = {
  abscissaConfig: {
    visDomain: [0, 50],
    isIndexAxis: true,
    showGrid: false,
    flip: false,
  },
  ordinateConfig: {
    visDomain: [40, 0],
    isIndexAxis: true,
    showGrid: false,
    flip: false,
  },
};

export const FlippedAxes = Template.bind({});
FlippedAxes.args = {
  abscissaConfig: {
    visDomain: [0, 50],
    isIndexAxis: true,
    showGrid: false,
    flip: true,
  },
  ordinateConfig: {
    visDomain: [40, 0],
    isIndexAxis: true,
    showGrid: false,
    flip: true,
  },
};

export default {
  title: 'Experimental/VisGroup',
  component: VisGroup,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen', controls: { sort: 'requiredFirst' } },
} as Meta;
