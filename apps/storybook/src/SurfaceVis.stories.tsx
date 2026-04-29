import { getDomain, mockValues, SurfaceVis } from '@h5web/lib';
import { assertDefined } from '@h5web/shared/guards';
import { createArrayFromView } from '@h5web/shared/vis-utils';
import { extend, type Object3DNode, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';

extend({ OrbitControls });
declare module '@react-three/fiber' {
  interface ThreeElements {
    orbitControls: Object3DNode<OrbitControls, typeof OrbitControls>;
  }
}

const dataArray = createArrayFromView(mockValues.fourD().pick(0, 0));
const domain = getDomain(dataArray.data);
assertDefined(domain);

const meta = preview.meta({
  title: 'Experimental/SurfaceVis',
  component: SurfaceVis,
  decorators: [FillHeight],
  argTypes: {
    dataArray: { control: false },
  },
});

export const Default = meta.story({
  render: (args) => (
    <SurfaceVis {...args}>
      <Controls />
    </SurfaceVis>
  ),
  args: {
    dataArray,
    domain,
  },
});

function Controls() {
  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);
  return <orbitControls args={[camera, domElement]} />;
}
