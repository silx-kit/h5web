import { getDomain, mockValues, SurfaceVis } from '@h5web/lib';
import { assertDefined } from '@h5web/shared/guards';
import { createArrayFromView } from '@h5web/shared/vis-utils';
import { extend, type Node, useThree } from '@react-three/fiber';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import FillHeight from './decorators/FillHeight';

extend({ OrbitControls });
declare module '@react-three/fiber' {
  interface ThreeElements {
    orbitControls: Node<OrbitControls, typeof OrbitControls>;
  }
}

const dataArray = createArrayFromView(mockValues.fourD().pick(0, 0));
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
      <Controls />
    </SurfaceVis>
  ),
  args: {
    dataArray,
    domain,
  },
} satisfies Story;

function Controls() {
  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);
  return <orbitControls args={[camera, domElement]} />;
}
