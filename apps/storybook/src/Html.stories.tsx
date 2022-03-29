import { Html, VisCanvas } from '@h5web/lib';
import type { Meta, Story } from '@storybook/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import FillHeight from './decorators/FillHeight';

interface Props {
  outside: boolean;
  mounted: boolean;
}

export const Default: Story<Props> = (props) => {
  const { outside, mounted } = props;
  const [outsideContainer, setOutsideContainer] = useState<HTMLDivElement>();
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement>();

  return (
    <>
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
    </>
  );
};

Default.args = {
  outside: false,
  mounted: true,
};

export default {
  title: 'Building Blocks/Html',
  component: Default,
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
} as Meta;
