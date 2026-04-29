import { DefaultInteractions, TooltipMesh, VisCanvas } from '@h5web/lib';
import { formatTooltipVal } from '@h5web/shared/vis-utils';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

const meta = preview.meta({
  title: 'Building Blocks/TooltipMesh',
  component: TooltipMesh,
  decorators: [FillHeight],
  argTypes: {
    guides: {
      control: { type: 'inline-radio' },
      options: ['horizontal', 'vertical', 'both', undefined],
    },
  },
});

interface TooltipContentProps {
  x: number;
  y: number;
  text?: string;
}

function TooltipContent(props: TooltipContentProps) {
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

export const Default = meta.story({
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
});

export const HorizontalGuide = Default.extend({
  args: {
    guides: 'horizontal',
    renderTooltip: (x, y) => (
      <TooltipContent text='guides="horizontal"' x={x} y={y} />
    ),
  },
});

export const VerticalGuide = Default.extend({
  args: {
    guides: 'vertical',
    renderTooltip: (x, y) => (
      <TooltipContent text='guides="vertical"' x={x} y={y} />
    ),
  },
});

export const BothGuides = Default.extend({
  args: {
    guides: 'both',
    renderTooltip: (x, y) => (
      <TooltipContent text='guides="both"' x={x} y={y} />
    ),
  },
});

export const GuidesOnly = Default.extend({
  args: {
    guides: 'both',
    renderTooltip: () => undefined,
  },
});
