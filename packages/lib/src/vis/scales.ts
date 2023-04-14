import { ScaleType } from '@h5web/shared';
import {
  type PickScaleConfigWithoutType,
  scaleLinear,
  scaleLog,
  scaleSqrt,
  scaleSymlog,
} from '@visx/scale';
import { type IconType } from 'react-icons/lib';
import { MdFilterList, MdFlare, MdSort } from 'react-icons/md';

import MdGraphicEqRotated from '../toolbar/controls/ScaleSelector/MdGraphicEqRotated';
import SqrtIcon from '../toolbar/controls/ScaleSelector/SqrtIcon';
import { type AxisScale } from './models';
import { scaleGamma } from './scaleGamma';

interface H5WebScale {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createScale: (config: any) => AxisScale;
  Icon: IconType;
  label: string;
  validMin: number;
}

export const H5WEB_SCALES: Record<ScaleType, H5WebScale> = {
  [ScaleType.Linear]: {
    createScale: (
      config: PickScaleConfigWithoutType<ScaleType.Linear, number>
    ) => scaleLinear<number>(config),
    Icon: MdSort,
    label: 'Linear',
    validMin: -Infinity,
  },
  [ScaleType.Log]: {
    createScale: (config: PickScaleConfigWithoutType<ScaleType.Log, number>) =>
      scaleLog<number>(config),
    Icon: MdFilterList,
    label: 'Log',
    validMin: Number.MIN_VALUE,
  },
  [ScaleType.SymLog]: {
    createScale: (
      config: PickScaleConfigWithoutType<ScaleType.SymLog, number>
    ) => scaleSymlog<number>(config),
    Icon: MdGraphicEqRotated,
    label: 'SymLog',
    validMin: -Infinity,
  },
  [ScaleType.Sqrt]: {
    createScale: (config: PickScaleConfigWithoutType<ScaleType.Sqrt, number>) =>
      scaleSqrt<number>(config),
    Icon: SqrtIcon,
    label: 'Square root',
    validMin: 0,
  },
  [ScaleType.Gamma]: {
    createScale: scaleGamma,
    Icon: MdFlare,
    label: 'Gamma',
    validMin: -Infinity,
  },
};
