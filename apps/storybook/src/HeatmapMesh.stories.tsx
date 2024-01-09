import type { Domain } from '@h5web/lib';
import {
  DefaultInteractions,
  getDomain,
  HeatmapMesh,
  mockValues,
  VisCanvas,
} from '@h5web/lib';
import { assertDefined } from '@h5web/shared/guards';
import { ScaleType } from '@h5web/shared/vis-models';
import { COLOR_SCALE_TYPES, toTypedNdArray } from '@h5web/shared/vis-utils';
import type { Meta, StoryObj } from '@storybook/react';
import { range } from 'lodash';
import ndarray from 'ndarray';
import { LinearFilter, NearestFilter } from 'three';

import FillHeight from './decorators/FillHeight';

const dataArray = mockValues.twoD();
const domain = getDomain(dataArray.data);
assertDefined(domain);

const uint16Values = [0x4900, 0x4d00, 0x4f80, 0x5100]; // 10, 20, 30, 40
const uint16DataArray = ndarray(Uint16Array.from(uint16Values), [2, 2]);
const uint16Domain: Domain = [10, 40];
const mask = ndarray(
  Uint8Array.from(
    range(0, 20 * 41).map((val) =>
      ((val % 41) * Math.floor(val / 41)) % 5 === 0 ? 255 : 0,
    ),
  ),
  [20, 41],
);

const meta = {
  title: 'Building Blocks/HeatmapMesh',
  component: HeatmapMesh,
  decorators: [FillHeight],
  parameters: { layout: 'fullscreen', controls: { sort: 'requiredFirst' } },
  args: {
    invertColorMap: false,
    magFilter: NearestFilter,
  },
  argTypes: {
    scaleType: {
      control: { type: 'inline-radio' },
      options: COLOR_SCALE_TYPES,
    },
    magFilter: {
      control: {
        type: 'inline-radio',
        labels: { [NearestFilter]: 'nearest', [LinearFilter]: 'linear' },
      },
      options: [NearestFilter, LinearFilter],
    },
  },
} satisfies Meta<typeof HeatmapMesh>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: (args) => {
    const [rows, cols] = args.values.shape;

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: [0, cols], isIndexAxis: true }}
        ordinateConfig={{ visDomain: [0, rows], isIndexAxis: true }}
      >
        <DefaultInteractions />
        <HeatmapMesh {...args} />
      </VisCanvas>
    );
  },
  args: {
    values: toTypedNdArray(dataArray, Float32Array),
    domain,
    scaleType: ScaleType.SymLog,
    colorMap: 'Inferno',
  },
} satisfies Story;

export const HalfFloatTexture = {
  ...Default,
  args: {
    values: uint16DataArray,
    domain: uint16Domain,
    scaleType: ScaleType.Linear,
    colorMap: 'Blues',
  },
} satisfies Story;

export const LinearMagFilter = {
  ...Default,
  args: {
    ...Default.args,
    magFilter: LinearFilter,
  },
} satisfies Story;

export const BadColor = {
  ...Default,
  args: {
    ...Default.args,
    domain: [0.1, 400],
    scaleType: ScaleType.Log,
    badColor: 'steelblue',
  },
} satisfies Story;

export const Mask = {
  ...Default,
  args: {
    ...Default.args,
    mask,
  },
} satisfies Story;
