import { DefaultInteractions, TooltipMesh, VisCanvas } from '@h5web/lib';
import { formatTooltipVal } from '@h5web/shared';
import type { Meta, StoryObj } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

const meta = {
  title: 'Building Blocks/TooltipMesh',
  component: TooltipMesh,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    guides: {
      control: { type: 'inline-radio' },
      options: ['horizontal', 'vertical', 'both'],
    },
  },
} satisfies Meta<typeof TooltipMesh>;

export default meta;
type Story = StoryObj<typeof meta>;

function TooltipContent(props: { x: number; y: number; text?: string }) {
  const { x, y, text } = props;
  return (
    <>
      {text && (
        <h3>
          <code>{text}</code>
        </h3>
      )}
      {`x=${formatTooltipVal(x)}, y=${formatTooltipVal(y)}`}
    </>
  );
}

export const Default = {
  render: (args) => (
    <VisCanvas
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      <DefaultInteractions />
      <TooltipMesh {...args} />
    </VisCanvas>
  ),
  args: {
    renderTooltip: (x, y) => <TooltipContent x={x} y={y} />,
  },
} satisfies Story;

export const HorizontalGuide = {
  ...Default,
  args: {
    guides: 'horizontal',
    renderTooltip: (x, y) => (
      <TooltipContent text={'guides="horizontal"'} x={x} y={y} />
    ),
  },
} satisfies Story;

export const VerticalGuide = {
  ...Default,
  args: {
    guides: 'vertical',
    renderTooltip: (x, y) => (
      <TooltipContent text={'guides="vertical"'} x={x} y={y} />
    ),
  },
} satisfies Story;

export const BothGuides = {
  ...Default,
  args: {
    guides: 'both',
    renderTooltip: (x, y) => (
      <TooltipContent text={'guides="both"'} x={x} y={y} />
    ),
  },
} satisfies Story;
