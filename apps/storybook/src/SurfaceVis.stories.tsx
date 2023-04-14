import { getDomain, SurfaceVis, type SurfaceVisProps } from '@h5web/lib';
import { createArrayFromView, getMockDataArray } from '@h5web/shared';
import { OrbitControls } from '@react-three/drei';
import { type Meta, type Story } from '@storybook/react/types-6-0';

import FillHeight from './decorators/FillHeight';

const dataArray = createArrayFromView(
  getMockDataArray('/nD_datasets/fourD').pick(0, 0, null, null)
);
const domain = getDomain(dataArray.data);

const Template: Story<SurfaceVisProps> = (args) => (
  <SurfaceVis {...args}>
    <OrbitControls />
  </SurfaceVis>
);

export const Default = Template.bind({});
Default.args = {
  dataArray,
  domain,
};

export default {
  title: 'Experimental/SurfaceVis',
  component: SurfaceVis,
  parameters: { layout: 'fullscreen', controls: { exclude: 'dataArray' } },
  decorators: [FillHeight],
} as Meta;
