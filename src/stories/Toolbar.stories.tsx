import { Title, Primary } from '@storybook/addon-docs';
import type { Meta, Story } from '@storybook/react';
import { useState } from 'react';
import { useToggle } from '@react-hookz/web';
import { FiTarget } from 'react-icons/fi';
import {
  ScaleType,
  Toolbar,
  DomainSlider,
  ColorMapSelector,
  ScaleSelector,
  Separator,
  ColorMap,
  GridToggler,
  ToggleGroup,
  ToggleBtn,
  CustomDomain,
} from '../packages/lib';

const Template: Story<{ narrow?: boolean }> = ({ narrow }) => {
  const [customDomain, setCustomDomain] = useState<CustomDomain>([null, null]);
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
      <div style={narrow ? { maxWidth: '30rem', marginLeft: 'auto' } : {}}>
        <Toolbar>
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
      </div>

      <pre style={{ padding: '0 1.5rem' }}>
        State = {JSON.stringify(allStates, null, 2)}
      </pre>
    </>
  );
};

export const Default = Template.bind({});

export const Responsive = Template.bind({});
Responsive.args = { narrow: true };

export default {
  title: 'Toolbar/Toolbar',
  parameters: {
    layout: 'fullscreen',
    docs: {
      source: { type: 'code' },
      page: () => (
        <>
          <Title />
          <p>
            The source code of the <em>Default</em> story demonstrates a basic
            use of the <code>Toolbar</code> component and associated toolbar
            controls. To reveal the code, click on <em>Show code</em> below the
            preview.
          </p>
          <p>
            The following toolbar controls are available:{' '}
            <code>DomainSlider</code>, <code>ColorMapSelector</code>,{' '}
            <code>ScaleSelector</code>, <code>GridToggler</code>, and the
            generic controls <code>ToggleBtn</code>, <code>ToggleGroup</code>{' '}
            and <code>ToggleGroup.Btn</code>.
          </p>
          <Primary />
        </>
      ),
    },
  },
} as Meta;
