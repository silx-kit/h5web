import {
  INTERPOLATORS,
  ScaleType,
  useDomain,
  VolumeQuality,
  VolumeRenderMode,
  VolumeVis,
  type VolumeVisProps,
} from '@h5web/lib';
import { assertDefined } from '@h5web/shared/guards';
import { COLOR_SCALE_TYPES } from '@h5web/shared/vis-models';
import { type NdArray } from 'ndarray';

import preview from '../.storybook/preview';
import FillHeight from './decorators/FillHeight';
import {
  createCloud,
  createGaussianBlob,
  createGyroid,
  createHardSphere,
  createInterference,
  createMandelbulb,
  createOrbital,
  createShells,
  createTorus,
} from './volumes';

const VOLUMES = {
  orbital: () => createOrbital(128),
  gyroid: () => createGyroid(128),
  mandelbulb: () => createMandelbulb(128),
  cloud: () => createCloud(128),
  shells: () => createShells(128),
  torus: () => createTorus(128),
  interference: () => createInterference(128),
  gaussian: () => createGaussianBlob(128),
  sphere: () => createHardSphere(128),
};

type VolumeName = keyof typeof VOLUMES;
const cache = new Map<VolumeName, NdArray<Float32Array>>();

// Generate volumes lazily, as they are too large to be passed as story args
function getVolume(name: VolumeName): NdArray<Float32Array> {
  const volume = cache.get(name) ?? VOLUMES[name]();
  cache.set(name, volume);
  return volume;
}

type Props = Omit<VolumeVisProps, 'dataArray' | 'domain'> & {
  volume?: VolumeName;
};

function VolumeStory(props: Props) {
  const { volume = 'orbital', scaleType, ...visProps } = props;

  const dataArray = getVolume(volume);
  const domain = useDomain(dataArray, { scaleType });
  assertDefined(domain);

  return (
    <VolumeVis
      {...visProps}
      dataArray={dataArray}
      domain={domain}
      scaleType={scaleType}
    />
  );
}

const meta = preview.meta({
  title: 'Visualizations/VolumeVis',
  component: VolumeStory,
  decorators: [FillHeight],
  args: {
    volume: 'orbital',
    mode: VolumeRenderMode.DVR,
    colorMap: 'Inferno',
    scaleType: ScaleType.Linear,
    opacity: 0.25,
    threshold: 0.05,
    quality: VolumeQuality.Medium,
    showBox: true,
  },
  argTypes: {
    volume: {
      control: { type: 'inline-radio' },
      options: Object.keys(VOLUMES),
    },
    mode: {
      control: { type: 'inline-radio' },
      options: Object.values(VolumeRenderMode),
    },
    colorMap: {
      control: { type: 'select' },
      options: Object.keys(INTERPOLATORS),
    },
    scaleType: {
      control: { type: 'inline-radio' },
      options: COLOR_SCALE_TYPES,
    },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    threshold: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    quality: {
      control: { type: 'inline-radio' },
      options: Object.values(VolumeQuality),
    },
    background: { control: { type: 'color' } },
  },
});

export const Default = meta.story();

export const MaximumIntensity = meta.story({
  args: {
    mode: VolumeRenderMode.MIP,
    colorMap: 'Magma',
    scaleType: ScaleType.Sqrt,
    threshold: 0.02,
  },
});

export const Isosurface = meta.story({
  args: {
    volume: 'mandelbulb',
    mode: VolumeRenderMode.Iso,
    colorMap: 'Turbo',
    threshold: 0.8,
    quality: VolumeQuality.High,
  },
});

export const Gyroid = meta.story({
  args: {
    volume: 'gyroid',
    colorMap: 'Viridis',
    opacity: 0.5,
    threshold: 0.3,
  },
});

export const Mandelbulb = meta.story({
  args: {
    volume: 'mandelbulb',
    colorMap: 'Plasma',
    opacity: 0.3,
    threshold: 0.3,
  },
});

export const TurbulentCloud = meta.story({
  args: {
    volume: 'cloud',
    colorMap: 'Blues',
    opacity: 0.3,
    threshold: 0.3,
  },
});

export const ConcentricShells = meta.story({
  args: {
    volume: 'shells',
    colorMap: 'Rainbow',
    opacity: 0.15,
    threshold: 0.6,
  },
});

export const Torus = meta.story({
  args: {
    volume: 'torus',
    mode: VolumeRenderMode.Iso,
    colorMap: 'Cool',
    threshold: 0.135, // ≈ e⁻², i.e. distance of ~0.2 to the core circle
  },
});

export const Interference = meta.story({
  args: {
    volume: 'interference',
    colorMap: 'RdBu',
    opacity: 0.3,
    threshold: 0.75,
  },
});

export const GaussianBlob = meta.story({
  args: {
    volume: 'gaussian',
    colorMap: 'Inferno',
    opacity: 0.1,
    threshold: 0,
  },
});

export const HardSphere = meta.story({
  args: {
    volume: 'sphere',
    colorMap: 'Greys',
    opacity: 0.15,
    threshold: 0.5,
  },
});
