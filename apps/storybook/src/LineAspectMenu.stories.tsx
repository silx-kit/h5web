import { CurveType, Interpolation, LineAspectMenu } from '@h5web/lib';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Toolbar/LineAspectMenu',
  component: LineAspectMenu,
  argTypes: {
    curveType: { control: false },
    interpolation: { control: false },
  },
} satisfies Meta<typeof LineAspectMenu>;

export default meta;
type Story = StoryObj<typeof LineAspectMenu>;

export const Default = {
  render: () => {
    const [curveType, setCurveType] = useState(CurveType.LineOnly);
    const [interpolation, setInterpolation] = useState(Interpolation.Linear);

    return (
      <LineAspectMenu
        curveType={curveType}
        onCurveTypeChanged={setCurveType}
        interpolation={interpolation}
        onInterpolationChanged={setInterpolation}
      />
    );
  },
} satisfies Story;
