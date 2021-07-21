import {
  scaleLinear,
  scaleLog,
  scaleSymlog,
  scaleSqrt,
  scalePower,
} from '@visx/scale';
import type { IconType } from 'react-icons/lib';
import type { AxisScale, GammaScaleConfig, VisxScaleConfig } from './models';
import { ScaleType } from './models';
import { MdSort, MdFilterList, MdFlare } from 'react-icons/md';
import SqrtIcon from '../../toolbar/controls/ScaleSelector/SqrtIcon';
import MdGraphicEqRotated from '../../toolbar/controls/ScaleSelector/MdGraphicEqRotated';
import type { NumberValue, ScalePower } from 'd3-scale';

interface H5WebScale {
  Icon: IconType;
  label: string;
  validMin: number;
}

export const H5WEB_SCALES: Record<ScaleType, H5WebScale> = {
  [ScaleType.Linear]: {
    Icon: MdSort,
    label: 'Linear',
    validMin: -Infinity,
  },
  [ScaleType.Log]: {
    Icon: MdFilterList,
    label: 'Log',
    validMin: Number.MIN_VALUE,
  },
  [ScaleType.SymLog]: {
    Icon: MdGraphicEqRotated,
    label: 'SymLog',
    validMin: -Infinity,
  },
  [ScaleType.Sqrt]: {
    Icon: SqrtIcon,
    label: 'Square root',
    validMin: 0,
  },
  [ScaleType.Gamma]: {
    Icon: MdFlare,
    label: 'Gamma',
    validMin: -Infinity,
  },
};

export function gammaScale(
  config: GammaScaleConfig
): ScalePower<number, number> {
  const linScale = scaleLinear<number>({ ...config, range: [0, 1] });
  const powScale = scalePower<number>({
    ...config,
    domain: [0, 1],
  });

  function gamma(value: NumberValue): number {
    return powScale(linScale(value));
  }

  const result = scalePower<number>(config);
  return Object.assign(gamma, {
    invert: (val: number) => linScale.invert(powScale.invert(val)),
    domain: result.domain,
    range: result.range,
    rangeRound: result.rangeRound,
    clamp: result.clamp,
    unknown: result.unknown,
    interpolate: result.interpolate, // To be fixed ?
    ticks: result.ticks,
    tickFormat: result.tickFormat,
    nice: result.nice,
    copy: result.copy,
    exponent: powScale.exponent,
  });
}

export function createScale(
  type: ScaleType.Gamma,
  config: GammaScaleConfig
): AxisScale;

export function createScale(
  type: ScaleType.Linear | ScaleType.Log | ScaleType.Sqrt | ScaleType.SymLog,
  config: VisxScaleConfig
): AxisScale;

export function createScale(
  type: ScaleType,
  config: VisxScaleConfig | GammaScaleConfig
) {
  switch (type) {
    case ScaleType.Linear:
      return scaleLinear<number>(config);
    case ScaleType.Log:
      return scaleLog<number>(config);
    case ScaleType.Sqrt:
      return scaleSqrt<number>(config);
    case ScaleType.SymLog:
      return scaleSymlog<number>(config);
    case ScaleType.Gamma:
      return gammaScale(config);
    default:
      throw new Error('Unknown scale type');
  }
}
