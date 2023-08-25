import type { CanvasEvent } from '@h5web/lib';
import {
  Annotation,
  DefaultInteractions,
  useCanvasEvent,
  VisCanvas,
} from '@h5web/lib';
import { useRafState } from '@react-hookz/web';
import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';

import FillHeight from './decorators/FillHeight';
import { formatCoord } from './utils';

const meta = {
  title: 'Building Blocks/Annotation',
  component: Annotation,
  parameters: {
    layout: 'fullscreen',
    controls: { sort: 'requiredFirst' },
  },
  decorators: [
    (Story) => (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, 41], showGrid: true }}
        ordinateConfig={{ visDomain: [0, 20], showGrid: true }}
      >
        <DefaultInteractions />
        <Story />
      </VisCanvas>
    ),
    FillHeight,
  ],
  args: {
    overflowCanvas: false,
    scaleOnZoom: false,
    center: false,
  },
} satisfies Meta<typeof Annotation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: (args) => {
    const { x, y, overflowCanvas, scaleOnZoom, center, style } = args;

    const features = [
      overflowCanvas ? 'overflows the canvas' : '',
      scaleOnZoom ? 'scales on zoom' : '',
    ]
      .filter((str) => str.length > 0)
      .join(' and ');

    return (
      <Annotation {...args}>
        <p
          style={{
            margin: 0,
            backgroundColor: 'rgba(0, 255, 0, 0.3)',
            ...style,
          }}
        >
          Annotation {center ? 'centered on' : 'positioned at'} ({x}, {y})
          {features && <> that {features}</>}
        </p>
        <svg
          width="30"
          height="30"
          fill="transparent"
          stroke="lightsalmon"
          strokeWidth={3}
          style={{
            position: 'absolute',
            top: center ? '50%' : 0,
            left: center ? '50%' : 0,
            transform: 'translate(-50%, -50%)',
            zIndex: -1,
            overflow: 'visible',
          }}
        >
          <line x1="0%" x2="100%" y1="50%" y2="50%" />
          <line x1="50%" x2="50%" y1="0%" y2="100%" />
        </svg>
      </Annotation>
    );
  },
  args: {
    x: 10,
    y: 16,
  },
} satisfies Story;

export const OverflowCanvas = {
  ...Default,
  args: {
    x: 6,
    y: 16,
    overflowCanvas: true,
  },
} satisfies Story;

export const Centered = {
  ...Default,
  args: {
    x: 5,
    y: 14,
    center: true,
  },
} satisfies Story;

export const ScaleOnZoom = {
  ...Default,
  args: {
    x: 10,
    y: 16,
    scaleOnZoom: true,
  },
} satisfies Story;

export const ScaleOnZoomCentered = {
  ...Default,
  args: {
    x: 10,
    y: 16,
    scaleOnZoom: true,
    center: true,
  },
} satisfies Story;

export const FollowPointer = {
  render: (args) => (
    <PointerTracker>
      {(x, y) => (
        <Annotation
          {...args}
          x={x + 0.5} // slight offset from pointer
          y={y - 0.5}
          style={{ whiteSpace: 'nowrap' }}
        >{`x=${formatCoord(x)}, y=${formatCoord(y)}`}</Annotation>
      )}
    </PointerTracker>
  ),
  args: {
    x: 0,
    y: 0,
  },
  argTypes: {
    x: { control: false },
    y: { control: false },
  },
} satisfies Story;

function PointerTracker(props: {
  children: (x: number, y: number) => ReactNode;
}) {
  const { children } = props;
  const [coords, setCoords] = useRafState<[number, number]>();

  useCanvasEvent('pointermove', (evt: CanvasEvent<PointerEvent>) => {
    const { x, y } = evt.dataPt;
    setCoords([x, y]);
  });

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{coords ? children(...coords) : null}</>;
}
