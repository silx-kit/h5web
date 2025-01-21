import { Overlay, Pan, ResetZoomButton, VisCanvas, Zoom } from '@h5web/lib';
import { type Meta, type StoryObj } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

const meta = {
  title: 'Building Blocks/Overlay',
  component: Overlay,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Overlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: (args) => {
    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, 3], showGrid: true }}
        ordinateConfig={{ visDomain: [50, 100] }}
      >
        <Zoom />
        <Pan />
        <ResetZoomButton />
        <Overlay
          {...args}
          style={{
            background:
              'linear-gradient(135deg, #444cf715 25%, transparent 25%) -20px 0/ 40px 40px, linear-gradient(225deg, #444cf715 25%, transparent 25%) -20px 0/ 40px 40px, linear-gradient(315deg, #444cf715 25%, transparent 25%) 0px 0/ 40px 40px, linear-gradient(45deg, #444cf715 25%, #e5e5f715 25%) 0px 0/ 40px 40px',
          }}
        >
          <div style={{ padding: '0 1rem', maxWidth: '60%', minWidth: '15em' }}>
            <p>
              This HTML overlay fills the canvas but lets pointer events
              through. Unlike <code>Annotation</code>, it is not affected by
              panning/zooming.
            </p>
            <p>
              By default, children of <code>Overlay</code> can overflow the
              bounds of the canvas. This can be changed with:{' '}
              <code>{`<Overlay style={{ overflow: 'hidden' }} />`}</code>
            </p>
          </div>
        </Overlay>
      </VisCanvas>
    );
  },
} satisfies Story;
