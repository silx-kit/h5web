import {
  scaleLinear,
  scaleLog,
  scaleSymlog,
  scaleSqrt,
  PickScaleConfigWithoutType,
} from '@visx/scale';
import type { IconType } from 'react-icons/lib';
import type { AxisScale } from './models';
import { ScaleType } from './models';
import { MdSort, MdFilterList, MdFlare } from 'react-icons/md';
import SqrtIcon from '../../toolbar/controls/ScaleSelector/SqrtIcon';
import MdGraphicEqRotated from '../../toolbar/controls/ScaleSelector/MdGraphicEqRotated';
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
