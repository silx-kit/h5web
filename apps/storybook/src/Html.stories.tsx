import {
  DefaultInteractions,
  FloatingControl,
  Html,
  useVisCanvasContext,
  VisCanvas,
} from '@h5web/lib';
import { useToggle } from '@react-hookz/web';
import type { Meta, StoryObj } from '@storybook/react';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import FillHeight from './decorators/FillHeight';

const meta = {
  title: 'Building Blocks/Html',
  component: Html,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, 3], showGrid: true }}
        ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
      >
        <DefaultInteractions />
        <Story />
      </VisCanvas>
    ),
    FillHeight,
  ],
} satisfies Meta<typeof Html>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: () => (
    <>
      <Html>
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: 40,
            width: '32em',
            padding: '0.5rem',
            border: '3px solid blue',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
          }}
        >
          This <code>div</code> element is a child of <code>VisCanvas</code>.
          Wrapping it with{' '}
          <strong>
            <code>Html</code>
          </strong>{' '}
          allows it to be rendered with React DOM instead of React Three Fiber's
          own renderer, which cannot render HTML elements.
        </div>
      </Html>

      <MyHtml>
        <MyDiv />
      </MyHtml>
    </>
  ),
  argTypes: {
    overflowCanvas: { control: false },
  },
} satisfies Story;

function MyHtml({ children }: PropsWithChildren<object>) {
  const { canvasSize } = useVisCanvasContext();

  return (
    <Html>
      <div
        style={{
          position: 'absolute',
          top: 130,
          left: 70,
          width: '32em',
          padding: '0.5rem',
          border: '3px solid magenta',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
        }}
      >
        This <code>div</code> element is wrapped in{' '}
        <strong>
          <code>Html</code>
        </strong>{' '}
        inside a custom React component called <code>MyHtml</code>, which has
        access to the <code>VisCanvas</code> and React Three Fiber contexts –
        e.g. <code>canvasWidth = {canvasSize.width}</code>
      </div>
      {children}
    </Html>
  );
}

function MyDiv() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 230,
        left: 130,
        width: '40em',
        padding: '0.5rem',
        border: '3px solid darkviolet',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
      }}
    >
      This <code>div</code> element is declared inside a component called{' '}
      <code>MyDiv</code>, which is passed as a child to <code>MyHtml</code>. It
      shows that HTML elements and their corresponding{' '}
      <strong>
        <code>Html</code>
      </strong>{' '}
      wrappers don't have to live inside the same React components. However,
      note that <code>MyDiv</code> does not have access to the{' '}
      <code>VisCanvas</code> and React Three Fiber contexts.
    </div>
  );
}

export const OverflowCanvas = {
  render: (args) => {
    const { overflowCanvas } = args;
    return (
      <Html overflowCanvas={overflowCanvas}>
        <div
          style={{
            position: 'absolute',
            top: overflowCanvas ? 45 : 30,
            left: overflowCanvas ? 30 : -50,
            width: '35em',
            padding: '0.5rem',
            border: '3px solid blue',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
          }}
        >
          <p>
            By default, <code>Html</code> renders its children next to the{' '}
            <code>canvas</code> element. With prop{' '}
            <strong>
              <code>overflowCanvas</code>
            </strong>
            , the children are rendered one level higher in the DOM instead,
            allowing them to overflow above the axes.
          </p>
          <p>
            This <code>div</code>{' '}
            <strong>
              {overflowCanvas ? 'overflows' : 'does not overflow'}
            </strong>{' '}
            the bounds of the canvas.
          </p>
        </div>
      </Html>
    );
  },
  args: {
    overflowCanvas: true,
  },
} satisfies Story;

export const Portal = {
  render: () => {
    const { visCanvas } = useVisCanvasContext();

    const [containerMounted, toggleContainer] = useToggle(true);
    const [customContainer, setCustomContainer] =
      useState<HTMLDivElement | null>(null);

    return (
      <>
        <Html>{containerMounted && <div ref={setCustomContainer} />}</Html>
        <Html>
          {customContainer &&
            createPortal(
              <p
                style={{
                  position: 'absolute',
                  top: 30,
                  left: 40,
                  width: '35em',
                  padding: '0.5rem',
                  border: '3px solid blue',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  textAlign: 'center',
                }}
              >
                This example demonstrates that, using a portal, children of{' '}
                <code>Html</code> can be rendered into a{' '}
                <strong>custom container</strong> (itself potentially rendered
                with <code>Html</code>).
              </p>,
              customContainer,
            )}
        </Html>
        <Html>
          {createPortal(
            <div
              style={{
                gridArea: 'canvas',
                justifySelf: 'start',
                alignSelf: 'end',
                width: '40em',
                padding: '0 1rem',
                border: '3px solid magenta',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <p>
                Using a portal, you can also render HTML elements into{' '}
                <strong>
                  <code>visCanvas</code>
                </strong>
                , the root <code>div</code> rendered by <code>VisCanvas</code>,
                which includes the axes. You can then take advantage of the CSS
                Grid defined on <code>visCanvas</code> to position your
                elements.
              </p>
              <p>
                However, note that your elements will interfere with canvas
                interactions (zoom, pan, etc.), since pointer events will no
                longer be able to bubble up to <code>canvasArea</code>. You can
                remedy this with <code>pointer-events: none</code>.
              </p>
            </div>,
            visCanvas,
          )}
        </Html>

        <FloatingControl>
          <button type="button" onClick={() => toggleContainer()}>
            {customContainer ? 'Unmount' : 'Mount'} custom container
          </button>
        </FloatingControl>
      </>
    );
  },
  argTypes: {
    overflowCanvas: { control: false },
  },
} satisfies Story;
