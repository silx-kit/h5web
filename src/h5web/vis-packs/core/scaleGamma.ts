import { scalePower } from '@visx/scale';
import type { Domain, ScaleGammaConfig } from './models';
import { interpolateNumber, interpolateRound } from 'd3-interpolate';
import type {
  InterpolatorFactory,
  NumberValue,
  ScalePower,
  UnknownReturnType,
} from 'd3-scale';
import { isNumber } from 'lodash';

function normalize(a: number, b: number) {
  const extent = b - a;
  return (x: number) => (extent !== 0 ? (x - a) / extent : 0.5);
}

type Range = number;
type Output = Range;
type Unknown = never;
export type ScaleGamma = ScalePower<Range, Output, Unknown>;

export function scaleGamma(config?: ScaleGammaConfig): ScaleGamma {
  let _domain: Domain = config?.domain || [0, 1];
  let _range: Domain = config?.range || [0, 1];
  let _exponent = config?.exponent ?? 1;
  let _clamp = config?.clamp || false;
  let _interpolate: InterpolatorFactory<Range, Output> = interpolateNumber;
  let _unknown: Unknown;

  const scaleFn = function (val: NumberValue) {
    const x = isNumber(val) ? val : val.valueOf();

    if (Number.isNaN(x)) {
      return _unknown;
    }

    return _interpolate(..._range)(
      normalize(..._domain)(clamper(x)) ** _exponent
    );
  };

  function clamper(x: number) {
    if (!_clamp) {
      return x;
    }
    const [d0, d1] = _domain;
    return Math.max(d0, Math.min(d1, x));
  }

  function domain(): Domain;
  function domain(d: Domain): typeof scale;
  function domain(d?: Domain) {
    if (d) {
      _domain = d;
      return scale;
    }
    return [..._domain];
  }

  function range(): Domain;
  function range(r: Domain): typeof scale;
  function range(r?: Domain) {
    if (r) {
      _range = r;
      return scale;
    }
    return [..._range];
  }

  function rangeRound(): Domain;
  function rangeRound(r: Domain): typeof scale;
  function rangeRound(r?: Domain) {
    if (r) {
      _range = r;
      _interpolate = interpolateRound;
      return scale;
    }
    return [..._range];
  }

  function clamp(): boolean;
  function clamp(c: boolean): typeof scale;
  function clamp(c?: boolean) {
    if (c) {
      _clamp = c;
      return scale;
    }
    return _clamp;
  }

  function unknown(): UnknownReturnType<Unknown, never>;
  function unknown() {
    return _unknown;
  }

  function interpolate(): InterpolatorFactory<Range, Output>;
  function interpolate(i: InterpolatorFactory<Range, Output>): typeof scale;
  function interpolate(i?: InterpolatorFactory<Range, Output>) {
    if (i) {
      _interpolate = i;
      return scale;
    }
    return _interpolate;
  }

  function exponent(): number;
  function exponent(e: number): typeof scale;
  function exponent(e?: number) {
    if (e) {
      _exponent = e;
      return scale;
    }
    return _exponent;
  }

  function invert(val: Output) {
    return clamper(
      interpolateNumber(..._domain)(
        normalize(..._range)(val) ** (1 / _exponent)
      )
    );
  }

  function _createGammaLikeScale() {
    return scalePower({
      domain: _domain,
      range: _range,
      exponent: _exponent,
      clamp: _clamp,
    });
  }

  function nice(count?: number | undefined) {
    const scaleLike = _createGammaLikeScale().nice(count);
    _domain = scaleLike.domain() as Domain;
    return scale;
  }

  function ticks(count?: number | undefined) {
    return _createGammaLikeScale().ticks(count);
  }

  function tickFormat(
    count?: number | undefined,
    specifier?: string | undefined
  ) {
    return _createGammaLikeScale().tickFormat(count, specifier);
  }

  function copy() {
    return scaleGamma()
      .domain(_domain)
      .range(_range)
      .exponent(_exponent)
      .clamp(_clamp)
      .interpolate(_interpolate);
  }

  const scale = Object.assign(scaleFn, {
    domain,
    range,
    rangeRound,
    clamp,
    interpolate,
    invert,
    unknown,
    exponent,
    nice,
    ticks,
    tickFormat,
    copy,
  });

  return scale;
}
