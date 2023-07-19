import { getDomain, SurfaceVis } from '@h5web/lib';
import {
  assertDefined,
  createArrayFromView,
  getMockDataArray,
} from '@h5web/shared';
import { OrbitControls } from '@react-three/drei';
import type { Meta, StoryObj } from '@storybook/react';

import FillHeight from './decorators/FillHeight';

const dataArray = createArrayFromView(
  getMockDataArray('/nD_datasets/fourD').pick(0, 0, null, null),
);
const domain = getDomain(dataArray.data);
assertDefined(domain);

const meta = {
  title: 'Experimental/SurfaceVis',
  component: SurfaceVis,
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
  argTypes: {
    dataArray: { control: false },
  },
} satisfies Meta<typeof SurfaceVis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: (args) => (
    <SurfaceVis {...args}>
      <OrbitControls />
    </SurfaceVis>
  ),
  args: {
    dataArray,
    domain,
  },
} satisfies Story;
