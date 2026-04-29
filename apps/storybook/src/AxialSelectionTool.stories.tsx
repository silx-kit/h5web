import {
  AxialSelectionTool,
  Box,
  Pan,
  ResetZoomButton,
  type Selection,
  SvgElement,
  SvgRect,
  VisCanvas,
  Zoom,
} from '@h5web/lib';
import { useThrottledState } from '@react-hookz/web';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';
import { getTitleForSelection } from './utils';

const meta = preview.meta({
  title: 'Building Blocks/Interactions/AxialSelectionTool',
  component: AxialSelectionTool,
  decorators: [FillHeight],
  argTypes: {
    axis: {
      control: { type: 'inline-radio' },
      options: ['x', 'y'],
    },
    modifierKey: {
      control: { type: 'inline-radio' },
      options: ['Alt', 'Control', 'Shift', undefined],
    },
  },
});

export const XAxis = meta.story({
  render: (args) => {
    const { modifierKey } = args;

    const [activeSelection, setActiveSelection] = useThrottledState<
      Selection | undefined
    >(undefined, 50);

    return (
      <VisCanvas
        title={getTitleForSelection(activeSelection?.data)}
        abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
        ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
      >
        <Pan modifierKey={modifierKey === 'Control' ? undefined : 'Control'} />
        <Zoom />
        <ResetZoomButton />

        <AxialSelectionTool
          {...args}
          onSelectionChange={setActiveSelection}
          onSelectionEnd={() => setActiveSelection(undefined)}
        >
          {({ html: htmlSelection }, _, isValid) => (
            <SvgElement>
              <SvgRect
                coords={htmlSelection}
                fill={isValid ? 'teal' : 'orangered'}
                fillOpacity={0.5}
              />
            </SvgElement>
          )}
        </AxialSelectionTool>
      </VisCanvas>
    );
  },
  args: {
    axis: 'x',
  },
});

export const YAxis = XAxis.extend({
  args: {
    axis: 'y',
  },
});

export const Disabled = XAxis.extend({
  args: {
    disabled: true,
  },
});

export const WithModifierKey = XAxis.extend({
  args: {
    modifierKey: 'Control',
  },
});

export const WithValidation = XAxis.extend({
  args: {
    validate: ({ html }) => Box.fromPoints(...html).hasMinSize(200),
  },
});
