import { Annotation, type CanvasEvent, useCanvasEvents } from '@h5web/lib';
import { useRafState } from '@react-hookz/web';
import { type Meta, type Story } from '@storybook/react';
import { useCallback } from 'react';
import { type Vector3 } from 'three';

import DefaultCanvas from './decorators/DefaultCanvas';
import FillHeight from './decorators/FillHeight';
import { formatCoord } from './utils';

export const Default: Story = () => (
  <>
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
          Annotations don't have to contain just text. You can also draw shapes
          with CSS and SVG.
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
  </>
);

export const WithZoom: Story = () => (
  <>
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
  </>
);

export const FollowPointer: Story = () => {
  const [coords, setCoords] = useRafState<Vector3>();

  const onPointerMove = useCallback(
    (evt: CanvasEvent<PointerEvent>) => {
      setCoords(evt.dataPt);
    },
    [setCoords]
  );

  useCanvasEvents({ onPointerMove });

  if (!coords) {
    return <></>; // eslint-disable-line react/jsx-no-useless-fragment
  }

  const { x, y } = coords;
  return (
    <Annotation
      x={x + 0.5} // slight offset from pointer
      y={y - 0.5}
      style={{ whiteSpace: 'nowrap' }}
    >{`x=${formatCoord(x)}, y=${formatCoord(y)}`}</Annotation>
  );
};

export default {
  title: 'Building Blocks/Annotation',
  parameters: { layout: 'fullscreen' },
  decorators: [DefaultCanvas, FillHeight],
} as Meta;
