import {
  PanMesh,
  VisCanvas,
  XAxisZoomMesh,
  YAxisZoomMesh,
  ZoomMesh,
} from '@h5web/lib';
import type { ModifierKey } from '@h5web/lib/src/vis/models';
import type { Meta, Story } from '@storybook/react';

import VisCanvasStoriesConfig from './VisCanvas.stories';

interface TemplateProps {
  disablePan?: boolean;
  panKey?: ModifierKey;
  disableZoom?: boolean;
  zoomKey?: ModifierKey;
  disableXZoom?: boolean;
  xZoomKey?: ModifierKey;
  disableYZoom?: boolean;
  yZoomKey?: ModifierKey;
}

const Template: Story<TemplateProps> = (args) => {
  const {
    disablePan,
    panKey,
    disableZoom,
    zoomKey,
    disableXZoom,
    xZoomKey,
    disableYZoom,
    yZoomKey,
  } = args;

  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [-10, 0], showGrid: true }}
      ordinateConfig={{ visDomain: [50, 100], showGrid: true }}
    >
      <PanMesh disabled={disablePan} modifierKey={panKey} />
      <ZoomMesh disabled={disableZoom} modifierKey={zoomKey} />
      <XAxisZoomMesh disabled={disableXZoom} modifierKey={xZoomKey} />
      <YAxisZoomMesh disabled={disableYZoom} modifierKey={yZoomKey} />
    </VisCanvas>
  );
};

const PanTemplate: Story<{
  disabled: boolean;
  modifierKey: ModifierKey;
}> = ({ disabled, modifierKey }) => (
  <Template disablePan={disabled} panKey={modifierKey} />
);

export const Pan = PanTemplate.bind({});

const ZoomTemplate: Story<{
  disabled: boolean;
  modifierKey: ModifierKey;
}> = ({ disabled, modifierKey }) => (
  <Template disableZoom={disabled} zoomKey={modifierKey} />
);
export const Zoom = ZoomTemplate.bind({});

const XZoomTemplate: Story<{
  disabled: boolean;
  modifierKey: ModifierKey;
}> = ({ disabled, modifierKey }) => (
  <Template disableXZoom={disabled} xZoomKey={modifierKey} />
);
export const XZoom = XZoomTemplate.bind({});
XZoom.args = {
  modifierKey: 'Alt', // Initialize to default value
};

const YZoomTemplate: Story<{
  disabled: boolean;
  modifierKey: ModifierKey;
}> = ({ disabled, modifierKey }) => (
  <Template disableYZoom={disabled} yZoomKey={modifierKey} />
);
export const YZoom = YZoomTemplate.bind({});
YZoom.args = {
  modifierKey: 'Shift', // Initialize to default value
};

export default {
  ...VisCanvasStoriesConfig,
  title: 'Building Blocks/VisCanvas/PanZoom',
  args: {
    disabled: false,
    modifierKey: undefined,
  },
  parameters: {
    ...VisCanvasStoriesConfig.parameters,
    controls: {
      include: ['disabled', 'modifierKey'],
    },
  },
  argTypes: {
    modifierKey: {
      control: { type: 'inline-radio' },
      options: ['Alt', 'Control', 'Shift'],
    },
  },
} as Meta;
