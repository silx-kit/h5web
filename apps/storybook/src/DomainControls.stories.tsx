import { DomainControls } from '@h5web/lib';
import type { Domain } from '@h5web/shared';
import { useToggle } from '@react-hookz/web';
import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';

const meta = {
  title: 'Toolbar/DomainControls',
  component: DomainControls,
  argTypes: {
    sliderDomain: { control: false },
    errors: { control: false },
    isAutoMin: { control: false },
    isAutoMax: { control: false },
    isEditingMin: { control: false },
    isEditingMax: { control: false },
  },
} satisfies Meta<typeof DomainControls>;

export default meta;
type Story = StoryObj<typeof DomainControls>;

export const Default = {
  render: (args) => {
    const { dataDomain } = args;

    const [sliderDomain, setSliderDomain] = useState<Domain>(dataDomain);
    const [isAutoMin, toggleAutoMin] = useToggle();
    const [isAutoMax, toggleAutoMax] = useToggle();
    const [isEditingMin, toggleEditingMin] = useToggle();
    const [isEditingMax, toggleEditingMax] = useToggle();

    useEffect(() => {
      setSliderDomain(dataDomain);
    }, [dataDomain]);

    return (
      <div style={{ maxWidth: '18rem' }}>
        <DomainControls
          sliderDomain={sliderDomain}
          dataDomain={dataDomain}
          errors={{}}
          isAutoMin={isAutoMin}
          isAutoMax={isAutoMax}
          onAutoMinToggle={() => {
            toggleAutoMin();
            if (!isAutoMin) {
              setSliderDomain([dataDomain[0], sliderDomain[1]]);
              toggleEditingMin(false);
            }
          }}
          onAutoMaxToggle={() => {
            toggleAutoMax();
            if (!isAutoMax) {
              setSliderDomain([sliderDomain[0], dataDomain[1]]);
              toggleEditingMax(false);
            }
          }}
          isEditingMin={isEditingMin}
          isEditingMax={isEditingMax}
          onEditMin={toggleEditingMin}
          onEditMax={toggleEditingMax}
          onChangeMin={(val) => setSliderDomain([val, sliderDomain[1]])}
          onChangeMax={(val) => setSliderDomain([sliderDomain[0], val])}
          onSwap={() => setSliderDomain([sliderDomain[1], sliderDomain[0]])}
        />
      </div>
    );
  },
  args: {
    dataDomain: [4, 400],
  },
} satisfies Story;
