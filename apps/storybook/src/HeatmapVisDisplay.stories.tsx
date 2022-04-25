import type { HeatmapVisProps } from '@h5web/lib';
import {
  HeatmapVis,
  getDomain,
  getMockDataArray,
  Annotation,
} from '@h5web/lib';
import { formatTooltipVal } from '@h5web/shared';
import type { Meta, Story } from '@storybook/react/types-6-0';

import HeatmapVisStoriesConfig from './HeatmapVis.stories';

const dataArray = getMockDataArray('/nD_datasets/twoD');
const domain = getDomain(dataArray.data);

const Template: Story<HeatmapVisProps> = (args) => <HeatmapVis {...args} />;

export const Fill = Template.bind({});
Fill.args = {
  dataArray,
  domain,
  layout: 'fill',
};

export const Contain = Template.bind({});
Contain.args = {
  dataArray,
  domain,
  layout: 'contain',
};

export const FlipYAxis = Template.bind({});
FlipYAxis.args = {
  dataArray,
  domain,
  flipYAxis: true,
};

export const NoGrid = Template.bind({});
NoGrid.args = {
  dataArray,
  domain,
  showGrid: false,
};

export const CustomTooltip = Template.bind({});
CustomTooltip.args = {
  dataArray,
  domain,
  abscissaParams: {
    value: Array.from({ length: dataArray.shape[1] }, (_, i) => 100 + 10 * i),
  },
  ordinateParams: {
    value: Array.from({ length: dataArray.shape[0] }, (_, i) => -5 + 0.5 * i),
  },
  renderTooltip: (data) => {
    const { abscissa, ordinate, xi, yi, x, y } = data;
    return (
      <>
        <div>
          <strong>{`value = ${dataArray.get(yi, xi)}`}</strong>
        </div>
        <div>{`abscissa = ${abscissa}, ordinate = ${ordinate}`}</div>
        <div>{`xi = ${xi}, yi = ${yi}`}</div>
        <div>{`x = ${formatTooltipVal(x)}, y=${formatTooltipVal(y)}`}</div>
      </>
    );
  },
};

export const WheelCapture = Template.bind({});
WheelCapture.args = { dataArray, domain };
WheelCapture.decorators = [
  (VisCanvasStory: Story) => (
    <>
      <div style={{ display: 'flex', height: '100vh' }}>
        <VisCanvasStory />
      </div>
      <div style={{ height: 500 }} />
    </>
  ),
];

export const WithTitle = Template.bind({});
WithTitle.args = {
  dataArray,
  domain,
  title: 'Pretty colors',
};

export const WithAxisLabels = Template.bind({});
WithAxisLabels.args = {
  dataArray,
  domain,
  abscissaParams: { label: 'Latitude' },
  ordinateParams: { label: 'Longitude' },
};

export const WithAnnotation: Story<HeatmapVisProps> = (args) => (
  <HeatmapVis {...args}>
    <Annotation x={10} y={15} style={{ color: 'white' }}>
      HTML annotation positioned at (10, 15)
    </Annotation>
    <Annotation
      x={10}
      y={5}
      center
      style={{
        width: 180,
        color: 'white',
        textAlign: 'center',
      }}
    >
      Another annotation, <strong>centred</strong> on (10, 5)
    </Annotation>
    <Annotation
      x={25}
      y={10}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: 320,
        height: 50,
        color: 'white',
        fontSize: '0.875rem',
        textAlign: 'center',
      }}
    >
      <>
        <p
          style={{
            flex: '1 1 0%',
            margin: 0,
            padding: '0.5rem',
            border: '10px solid pink',
          }}
        >
          Annotations don't have to contain just text. You can also draw shapes
          with CSS and SVG.
        </p>
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
          }}
        >
          <rect
            width="100%"
            height="100%"
            fill="none"
            stroke="papayawhip"
            strokeWidth={5}
          />
        </svg>
      </>
    </Annotation>
  </HeatmapVis>
);

WithAnnotation.args = {
  dataArray,
  domain,
};

export const WithAnnotationZoom: Story<HeatmapVisProps> = (args) => (
  <HeatmapVis {...args}>
    <Annotation
      x={10}
      y={15}
      scaleOnZoom
      style={{ width: 230, color: 'white' }}
    >
      HTML annotation at (10, 15) that scales with zoom.
    </Annotation>
    <Annotation
      x={25}
      y={10}
      scaleOnZoom
      center
      style={{
        width: 320,
        color: 'white',
        textAlign: 'center',
      }}
    >
      Another annotation that scales with zoom but this time{' '}
      <strong>centred</strong> on (25, 10)
    </Annotation>
  </HeatmapVis>
);
WithAnnotationZoom.args = {
  dataArray,
  domain,
};

export default {
  ...HeatmapVisStoriesConfig,
  title: 'Visualizations/HeatmapVis/Display',
} as Meta;
