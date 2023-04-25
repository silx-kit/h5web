import { DefaultInteractions, Html, VisCanvas } from '@h5web/lib';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import FillHeight from './decorators/FillHeight';

const meta = {
  title: 'Building Blocks/Html',
  component: Html,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    container: { control: false },
  },
} satisfies Meta<typeof Html>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: (args) => {
    const { overflowCanvas } = args;
    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, 3], showGrid: true }}
        ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
      >
        <DefaultInteractions />
        <Html overflowCanvas={overflowCanvas}>
          <div
            style={{
              position: 'absolute',
              top: overflowCanvas ? 45 : 30,
              left: overflowCanvas ? 30 : -50,
              width: '30em',
              padding: '0.5rem',
              border: '3px solid blue',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
            }}
          >
            This <code>div</code>{' '}
            <strong>
              {overflowCanvas ? 'overflows' : 'does not overflow'}
            </strong>{' '}
            the canvas.
          </div>
        </Html>
      </VisCanvas>
    );
  },
} satisfies Story;

export const OverflowCanvas = {
  ...Default,
  args: {
    overflowCanvas: true,
  },
} satisfies Story;

export const CustomContainer = {
  render: (args) => {
    const [container, setContainer] = useState<HTMLDivElement>();
    const [portalTarget, setPortalTarget] = useState<HTMLDivElement>();

    return (
      <div style={{ display: 'flex' }}>
        <VisCanvas
          abscissaConfig={{ visDomain: [0, 3], showGrid: true }}
          ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
        >
          <DefaultInteractions />
          <Html {...args} container={container}>
            <div
              ref={(elem) => setPortalTarget(elem || undefined)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                padding: '0.5rem',
                border: '3px solid blue',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <p>
                This <code>div</code> is rendered in a custom container{' '}
                <strong>next to</strong> <code>VisCanvas</code>.
              </p>
            </div>
          </Html>

          {portalTarget && (
            <Html>
              {createPortal(
                <p>
                  This paragraph appears in the same <code>div</code> but is
                  rendered with a separate <code>Html</code> element and a
                  portal.
                </p>,
                portalTarget
              )}
            </Html>
          )}
        </VisCanvas>

        <div ref={(elem) => elem && setContainer(elem)} />
      </div>
    );
  },
  argTypes: {
    overflowCanvas: { control: false },
  },
} satisfies Story;
