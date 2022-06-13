import { Annotation, DefaultInteractions, VisCanvas } from '@h5web/lib';
import type { Meta, Story } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

export const Default: Story = () => (
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
  </VisCanvas>
);

export const WithZoom: Story = () => (
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
);

export default {
  title: 'Building Blocks/Annotation',
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
} as Meta;
