import {
  Annotation,
  DataToHtml,
  DefaultInteractions,
  ResetZoomButton,
  SvgCircle,
  SvgElement,
  TooltipMesh,
  VisCanvas,
} from '@h5web/lib';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Vector3 } from 'three';

import FillHeight from './decorators/FillHeight';

const meta = {
  decorators: [FillHeight],
  tags: ['!dev'], // hide from sidebar (use in `Stacking.mdx` doc page only)
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: () => (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, 41], showGrid: true }}
      ordinateConfig={{ visDomain: [0, 20], showGrid: true }}
    >
      <DefaultInteractions />
      <ResetZoomButton />
      <DataToHtml points={[new Vector3(20, 10), new Vector3(24, 10)]}>
        {(pt1, pt2) => (
          <SvgElement>
            <SvgCircle coords={[pt1, pt2]} fill="lightblue" />
          </SvgElement>
        )}
      </DataToHtml>
      <Annotation
        x={20}
        y={10}
        style={{
          backgroundColor: 'lightgreen',
          padding: '1rem',
          whiteSpace: 'nowrap',
        }}
      >
        <p style={{ margin: 0 }}>HTML annotation</p>
      </Annotation>
      <TooltipMesh guides="both" renderTooltip={() => <>Tooltip</>} />
    </VisCanvas>
  ),
} satisfies Story;
