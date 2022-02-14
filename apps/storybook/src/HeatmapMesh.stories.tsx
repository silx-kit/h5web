import {
  getDomain,
  getMockDataArray,
  HeatmapMesh,
  VisCanvas,
} from '@h5web/lib';
import type { HeatmapMeshProps, Domain } from '@h5web/lib';
import { ScaleType, toTypedNdArray } from '@h5web/shared';
import type { Meta, Story } from '@storybook/react/types-6-0';
import ndarray from 'ndarray';
import {
  ByteType,
  FloatType,
  HalfFloatType,
  IntType,
  LinearFilter,
  NearestFilter,
  ShortType,
  UnsignedByteType,
  UnsignedIntType,
  UnsignedShortType,
} from 'three';

import FillHeight from './decorators/FillHeight';

const dataArray = getMockDataArray('/nD_datasets/twoD');
const domain = getDomain(dataArray.data);

const uint16Values = [0x49_00, 0x4d_00, 0x4f_80, 0x51_00]; // 10, 20, 30, 40
const uint16DataArray = ndarray(Uint16Array.from(uint16Values), [2, 2]);
const uint16Domain: Domain = [10, 40];

const Template: Story<HeatmapMeshProps> = (args) => {
  const { shape } = args.values;
  const [rows, cols] = shape;

  return (
    <VisCanvas
      abscissaConfig={{ visDomain: [0, cols], isIndexAxis: true }}
      ordinateConfig={{ visDomain: [0, rows], isIndexAxis: true }}
    >
      <HeatmapMesh {...args} />
    </VisCanvas>
  );
};

export const Default = Template.bind({});
Default.args = {
  values: toTypedNdArray(dataArray, Float32Array),
  domain,
  scaleType: ScaleType.SymLog,
  colorMap: 'Inferno',
};

export const HalfFloatTexture = Template.bind({});
HalfFloatTexture.args = {
  values: uint16DataArray,
  domain: uint16Domain,
  scaleType: ScaleType.Linear,
  colorMap: 'Blues',
};

export const LinearMagFilter = Template.bind({});
LinearMagFilter.args = {
  ...Default.args,
  magFilter: LinearFilter,
};

export default {
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
      options: [
        ScaleType.Linear,
        ScaleType.Log,
        ScaleType.SymLog,
        ScaleType.Sqrt,
      ],
    },
    magFilter: {
      control: {
        type: 'inline-radio',
        labels: { [NearestFilter]: 'nearest', [LinearFilter]: 'linear' },
      },
      options: [NearestFilter, LinearFilter],
    },
    textureType: {
      control: {
        labels: {
          [UnsignedByteType]: 'unsigned byte',
          [ByteType]: 'byte',
          [ShortType]: 'short',
          [UnsignedShortType]: 'unsigned short',
          [IntType]: 'int',
          [UnsignedIntType]: 'unsigned int',
          [FloatType]: 'float',
          [HalfFloatType]: 'half float',
        },
      },
      options: [
        UnsignedByteType,
        ByteType,
        ShortType,
        UnsignedShortType,
        IntType,
        UnsignedIntType,
        FloatType,
        HalfFloatType,
      ],
    },
  },
} as Meta;
