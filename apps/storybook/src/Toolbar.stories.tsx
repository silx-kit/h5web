import type { ColorMap, CustomDomain } from '@h5web/lib';
import {
  Btn,
  ColorMapSelector,
  DomainSlider,
  GridToggler,
  ScaleSelector,
  ScaleType,
  Separator,
  ToggleBtn,
  ToggleGroup,
  Toolbar,
} from '@h5web/lib';
import { useToggle } from '@react-hookz/web';
import type { Meta, StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FiTarget } from 'react-icons/fi';

const meta = {
  title: 'Toolbar/Toolbar',
  component: Toolbar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: function Template(args) {
    const [customDomain, setCustomDomain] = useState<CustomDomain>([
      null,
      null,
    ]);
    const [colorMap, setColorMap] = useState<ColorMap>('Viridis');
    const [invertColorMap, toggleColorMapInversion] = useToggle();
    const [scaleType, setScaleType] = useState(ScaleType.Linear);
    const [showGrid, toggleGrid] = useToggle();
    const [withTest, toggleTest] = useToggle(true);
    const [foo, setFoo] = useState('bar');

    const allStates = {
      customDomain,
      colorMap,
      invertColorMap,
      scaleType,
      showGrid,
      withTest,
      foo,
    };

    return (
      <>
        <Toolbar {...args}>
          <DomainSlider
            dataDomain={[1, 100]}
            customDomain={customDomain}
            scaleType={scaleType}
            onCustomDomainChange={setCustomDomain}
          />

          <Separator />
          <ColorMapSelector
            value={colorMap}
            onValueChange={setColorMap}
            invert={invertColorMap}
            onInversionChange={toggleColorMapInversion}
          />

          <Separator />
          <ScaleSelector value={scaleType} onScaleChange={setScaleType} />

          <Separator />
          <GridToggler value={showGrid} onToggle={toggleGrid} />
          <ToggleBtn
            label="Test"
            iconOnly
            icon={FiTarget}
            value={withTest}
            onToggle={toggleTest}
          />

          <Separator />
          <ToggleGroup
            role="radiogroup"
            ariaLabel="Foo"
            value={foo}
            onChange={setFoo}
          >
            <ToggleGroup.Btn label="Bar" value="bar" />
            <ToggleGroup.Btn label="Baz" value="baz" />
          </ToggleGroup>
        </Toolbar>

        <pre style={{ padding: '0 1.5rem' }}>
          State = {JSON.stringify(allStates, null, 2)}
        </pre>
      </>
    );
  },
} satisfies Story;

export const Responsive = {
  ...Default,
  decorators: [
    (Story: StoryFn) => (
      <div
        style={{ maxWidth: '30rem', marginLeft: 'auto', marginRight: 'auto' }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Story;

export const DocumentInteractions = {
  ...Default,
  args: {
    interactions: [
      { shortcut: 'Wheel', description: 'Turn' },
      { shortcut: 'Space', description: 'Accelerate' },
      { shortcut: 'Ctrl+Alt', description: 'Do a backflip' },
    ],
  },
} satisfies Story;

export const OverflowChildren = {
  ...Default,
  args: {
    overflowChildren: <Btn label="Some button" onClick={() => {}} />,
  },
} satisfies Story;
