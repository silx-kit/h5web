import {
  Btn,
  type ColorMap,
  ColorMapSelector,
  type CustomDomain,
  DomainWidget,
  ScaleSelector,
  ScaleType,
  Separator,
  ToggleBtn,
  ToggleGroup,
  Toolbar,
} from '@h5web/lib';
import { type AxisScaleType } from '@h5web/shared/vis-models';
import { AXIS_SCALE_TYPES } from '@h5web/shared/vis-utils';
import { useToggle } from '@react-hookz/web';
import { useState } from 'react';
import { FiTarget } from 'react-icons/fi';
import { MdGridOn } from 'react-icons/md';

import preview from '../.storybook/preview';

const meta = preview.meta({
  title: 'Toolbar/Toolbar',
  component: Toolbar,
});

export const Default = meta.story({
  render: (args) => {
    const [customDomain, setCustomDomain] = useState<CustomDomain>([
      null,
      null,
    ]);
    const [colorMap, setColorMap] = useState<ColorMap>('Viridis');
    const [invertColorMap, toggleColorMapInversion] = useToggle();
    const [scaleType, setScaleType] = useState<AxisScaleType>(ScaleType.Linear);
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
          <DomainWidget
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
          <ScaleSelector
            value={scaleType}
            onScaleChange={setScaleType}
            options={AXIS_SCALE_TYPES}
          />

          <Separator />

          <ToggleBtn
            label="Grid"
            Icon={MdGridOn}
            value={showGrid}
            onToggle={toggleGrid}
          />
          <ToggleBtn
            label="Test"
            iconOnly
            Icon={FiTarget}
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
});

export const Responsive = Default.extend({
  decorators: [
    (Story) => (
      <div
        style={{ maxWidth: '30rem', marginLeft: 'auto', marginRight: 'auto' }}
      >
        <Story />
      </div>
    ),
  ],
});

export const WithInteractionsHelp = Default.extend({
  args: {
    interactions: [
      { shortcut: 'Wheel', description: 'Turn' },
      { shortcut: 'Space', description: 'Accelerate' },
      { shortcut: 'Ctrl+Alt', description: 'Do a backflip' },
    ],
  },
});

export const OverflowChildren = Default.extend({
  args: {
    overflowChildren: <Btn label="Some button" onClick={() => {}} />,
  },
});
