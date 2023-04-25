import type { CanvasEvent } from '@h5web/lib';
import {
  Annotation,
  DefaultInteractions,
  useCanvasEvents,
  VisCanvas,
} from '@h5web/lib';
import { useRafState } from '@react-hookz/web';
import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { useCallback } from 'react';

import FillHeight from './decorators/FillHeight';
import { formatCoord } from './utils';

const meta = {
  title: 'Building Blocks/Annotation',
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: () => (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 41], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 20], showGrid: true }}
    >
      <DefaultInteractions />
      <Annotation x={10} y={16}>
        HTML annotation positioned at (10, 16)
      </Annotation>
      <Annotation
        x={10}
        y={6}
        center
        style={{
          width: 180,
          textAlign: 'center',
        }}
      >
        Another annotation, <strong>centred</strong> on (10, 6)
      </Annotation>
      <Annotation
        x={25}
        y={10}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: 320,
          height: 75,
          fontSize: '0.875rem',
          textAlign: 'center',
        }}
      >
        <>
          <p
            style={{
              flex: '1 1 0%',
              margin: 0,
              padding: '0.5rem',
              border: '10px solid pink',
            }}
          >
            Annotations don't have to contain just text. You can also draw
            shapes with CSS and SVG.
          </p>
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'visible',
            }}
          >
            <rect
              width="100%"
              height="100%"
              fill="none"
              stroke="darksalmon"
              strokeWidth={5}
            />
          </svg>
        </>
      </Annotation>
    </VisCanvas>
  ),
} satisfies Story;

export const WithZoom = {
  render: () => (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 41], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 20], showGrid: true }}
    >
      <DefaultInteractions />
      <Annotation x={10} y={16} scaleOnZoom style={{ width: 230 }}>
        HTML annotation at (10, 16) that scales with zoom.
      </Annotation>
      <Annotation
        x={25}
        y={10}
        scaleOnZoom
        center
        style={{ width: 320, textAlign: 'center' }}
      >
        Another annotation that scales with zoom but this time{' '}
        <strong>centred</strong> on (25, 10)
      </Annotation>
    </VisCanvas>
  ),
} satisfies Story;

function PointerTracker(props: {
  children: (x: number, y: number) => ReactNode;
}) {
  const { children } = props;
  const [coords, setCoords] = useRafState<[number, number]>();

  const onPointerMove = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      const { x, y } = evt.dataPt;
      setCoords([x, y]);
    },
    [setCoords]
  );

  useCanvasEvents({ onPointerMove });

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{coords ? children(...coords) : null}</>;
}

export const FollowPointer = {
  render: () => (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 41], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 20], showGrid: true }}
    >
      <DefaultInteractions />
      <PointerTracker>
        {(x, y) => (
          <Annotation
            x={x + 0.5} // slight offset from pointer
            y={y - 0.5}
            style={{ whiteSpace: 'nowrap' }}
          >{`x=${formatCoord(x)}, y=${formatCoord(y)}`}</Annotation>
        )}
      </PointerTracker>
    </VisCanvas>
  ),
} satisfies Story;
