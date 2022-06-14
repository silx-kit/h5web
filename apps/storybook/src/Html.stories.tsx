import { Html, VisCanvas } from '@h5web/lib';
import type { Meta, Story } from '@storybook/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import FillHeight from './decorators/FillHeight';

export const Default: Story<{ overflowCanvas: boolean }> = (args) => {
  const { overflowCanvas } = args;
  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 3], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      <Html overflowCanvas={overflowCanvas}>
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: -50,
            width: '30em',
            padding: '0.5rem',
            border: '3px solid blue',
            textAlign: 'center',
          }}
        >
          This <code>div</code>{' '}
          <strong>{overflowCanvas ? 'overflows' : 'does not overflow'}</strong>{' '}
          the canvas.
        </div>
      </Html>
    </VisCanvas>
  );
};

Default.args = {
  overflowCanvas: false,
};

export const Container: Story<{
  outside: boolean;
  mounted: boolean;
}> = (args) => {
  const { outside, mounted } = args;
  const [outsideContainer, setOutsideContainer] = useState<HTMLDivElement>();
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement>();

  return (
    <div style={{ display: 'flex' }}>
      <VisCanvas
        abscissaConfig={{ visDomain: [0, 3] }}
        ordinateConfig={{ visDomain: [50, 100] }}
      >
        {mounted && (
          <Html container={outside ? outsideContainer : undefined}>
            <div
              ref={(elem) => setPortalContainer(elem || undefined)}
              style={{ position: 'absolute', top: 0, left: 10 }}
            >
              <p>
                This <code>div</code> is rendered in a container{' '}
                <strong>{outside ? 'next to' : 'inside'}</strong> VisCanvas.
              </p>
            </div>
          </Html>
        )}
        {portalContainer && (
          <Html>
            {createPortal(
              <p>
                This text is rendered in the <code>div</code> above with a
                portal.
              </p>,
              portalContainer
            )}
          </Html>
        )}
      </VisCanvas>

      <div ref={(elem) => elem && setOutsideContainer(elem)} />
    </div>
  );
};

Container.args = {
  outside: false,
  mounted: true,
};

export default {
  title: 'Building Blocks/Html',
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
} as Meta;
