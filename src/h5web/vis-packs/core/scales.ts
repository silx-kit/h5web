import {
  scaleLinear,
  scaleLog,
  scaleSymlog,
  scaleSqrt,
  PickScaleConfig,
} from '@visx/scale';
import type { IconType } from 'react-icons/lib';
import type { AxisScale } from './models';
import { ScaleType } from './models';
import { MdSort, MdFilterList } from 'react-icons/md';
import SqrtIcon from '../../toolbar/controls/ScaleSelector/SqrtIcon';
import MdGraphicEqRotated from '../../toolbar/controls/ScaleSelector/MdGraphicEqRotated';

interface H5WebScale {
  createScale: (
    config: Omit<PickScaleConfig<ScaleType, number>, 'type'>
  ) => AxisScale;
  Icon: IconType;
  label: string;
  validMin: number;
}

export const H5WEB_SCALES: Record<ScaleType, H5WebScale> = {
  [ScaleType.Linear]: {
    createScale: (config) => scaleLinear<number>(config),
    Icon: MdSort,
    label: 'Linear',
    validMin: -Infinity,
  },
  [ScaleType.Log]: {
    createScale: (config) => scaleLog<number>(config),
    Icon: MdFilterList,
    label: 'Log',
    validMin: Number.MIN_VALUE,
  },
  [ScaleType.SymLog]: {
    createScale: (config) => scaleSymlog<number>(config),
    Icon: MdGraphicEqRotated,
    label: 'SymLog',
    validMin: -Infinity,
  },
  [ScaleType.Sqrt]: {
    createScale: (config) => scaleSqrt<number>(config),
    Icon: SqrtIcon,
    label: 'Square root',
    validMin: 0,
  },
};
