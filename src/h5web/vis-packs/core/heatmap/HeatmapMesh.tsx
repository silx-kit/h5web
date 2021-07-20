import { rgb } from 'd3-color';
import { memo, useMemo } from 'react';
import {
  RedFormat,
  DataTexture,
  FloatType,
  RGBFormat,
  UnsignedByteType,
} from 'three';
import type { Domain } from '../models';
import { ScaleType } from '../models';
import { useAxisSystemContext } from '../shared/AxisSystemContext';
import VisMesh from '../shared/VisMesh';
import type { ColorMap, VisScaleType, ScaleShader } from './models';
import { isScaleType } from '../utils';
import { getInterpolator } from './utils';
import { assertDefined } from '../../../guards';

interface Props {
  rows: number;
  cols: number;
  values: number[];
  domain: Domain;
  colorMap: ColorMap;
  scaleType: VisScaleType;
  invertColorMap?: boolean;
  alphaValues?: number[];
  alphaDomain?: Domain;
}

const CMAP_SIZE = 256;

const SCALE_SHADER: Record<ScaleType, ScaleShader> = {
  [ScaleType.Linear]: {
    uniforms: (domain: Domain) => ({
      min: { value: domain[0] },
      oneOverRange: { value: 1 / (domain[1] - domain[0]) },
    }),
    fragment: `
      uniform float min;
      uniform float oneOverRange;

      float scale(float value) {
        return oneOverRange * (value - min);
      }

      bool isSupported(float value) {
        return true;
      }`,
  },
  [ScaleType.Log]: {
    uniforms: (domain: Domain) => {
      const logDomain = domain.map(Math.log10);
      return {
        min: { value: logDomain[0] },
        oneOverRange: { value: 1 / (logDomain[1] - logDomain[0]) },
      };
    },
    fragment: `
      uniform float min;
      uniform float oneOverRange;

      const float oneOverLog10 = 0.43429448190325176;
      float scale(float value) {
        return oneOverRange * (log(value) * oneOverLog10 - min);
      }

      bool isSupported(float value) {
        return value > 0.;
      }`,
  },
  [ScaleType.SymLog]: {
    uniforms: (domain: Domain) => {
      const symlogDomain = domain.map(
        (val) => Math.sign(val) * Math.log10(1 + Math.abs(val))
      );
      return {
        min: { value: symlogDomain[0] },
        oneOverRange: { value: 1 / (symlogDomain[1] - symlogDomain[0]) },
      };
    },
    fragment: `
      uniform float min;
      uniform float oneOverRange;

      const float oneOverLog10 = 0.43429448190325176;
      float symlog(float x) {
        return sign(x) * log(1. + abs(x)) * oneOverLog10;
      }

      float scale(float value) {
        return oneOverRange * (symlog(value) - min);
      }

      bool isSupported(float value) {
        return true;
      }`,
  },
  [ScaleType.Sqrt]: {
    uniforms: (domain: Domain) => {
      const sqrtDomain = domain.map(Math.sqrt);
      return {
        min: { value: sqrtDomain[0] },
        oneOverRange: { value: 1 / (sqrtDomain[1] - sqrtDomain[0]) },
      };
    },
    fragment: `
      uniform float min;
      uniform float oneOverRange;

      float scale(float value) {
        return oneOverRange * (sqrt(value) - min);
      }

      bool isSupported(float value) {
        return value >= 0.;
      }`,
  },
  [ScaleType.Gamma]: {
    uniforms: (domain: Domain, exponent?: number) => {
      assertDefined(exponent);
      return {
        min: { value: domain[0] },
        oneOverRange: { value: 1 / (domain[1] - domain[0]) },
        gammaExponent: { value: exponent },
      };
    },
    fragment: `
      uniform float min;
      uniform float oneOverRange;
      uniform float gammaExponent;

      float scale(float value) {
        return pow(oneOverRange * (value - min), gammaExponent);
      }

      bool isSupported(float value) {
        return true;
      }`,
  },
};

function HeatmapMesh(props: Props) {
  const {
    rows,
    cols,
    values,
    domain,
    colorMap,
    scaleType,
    invertColorMap = false,
    alphaValues,
    alphaDomain,
  } = props;

  const dataTexture = useMemo(() => {
    const valuesArr = Float32Array.from(values);
    return new DataTexture(valuesArr, cols, rows, RedFormat, FloatType);
  }, [cols, rows, values]);

  const alphaTexture = useMemo(() => {
    if (!alphaValues) {
      return undefined;
    }
    const valuesArr = Float32Array.from(alphaValues);
    return new DataTexture(valuesArr, cols, rows, RedFormat, FloatType);
  }, [cols, rows, alphaValues]);

  const colorMapTexture = useMemo(() => {
    const interpolator = getInterpolator(colorMap, invertColorMap);

    const colors = Uint8Array.from(
      Array.from({ length: CMAP_SIZE }).flatMap((_, i) => {
        const { r, g, b } = rgb(interpolator(i / (CMAP_SIZE - 1)));
        return [r, g, b];
      })
    );

    return new DataTexture(colors, CMAP_SIZE, 1, RGBFormat, UnsignedByteType);
  }, [colorMap, invertColorMap]);

  const scaleUniforms = isScaleType(scaleType)
    ? SCALE_SHADER[scaleType].uniforms(domain)
    : SCALE_SHADER[ScaleType.Gamma].uniforms(domain, scaleType[1] as number);

  const { ordinateConfig } = useAxisSystemContext();
  const shader = {
    uniforms: {
      data: { value: dataTexture },
      withAlpha: { value: alphaValues ? 1 : 0 },
      alpha: { value: alphaTexture },
      colorMap: { value: colorMapTexture },
      alphaMin: { value: alphaDomain && alphaDomain[0] },
      oneOverAlphaRange: {
        value: alphaDomain && 1 / (alphaDomain[1] - alphaDomain[0]),
      },
      ...scaleUniforms,
    },
    vertexShader: `
      varying vec2 coords;

      void main() {
        coords = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: `
      uniform sampler2D data;
      uniform sampler2D colorMap;
      uniform int scaleType;
      uniform float alphaMin;
      uniform sampler2D alpha;
      uniform float oneOverAlphaRange;
      uniform int withAlpha;

      const vec4 nanColor = vec4(255, 255, 255, 1);

      varying vec2 coords;

      ${
        SCALE_SHADER[isScaleType(scaleType) ? scaleType : ScaleType.Gamma]
          .fragment
      }

      void main() {
        float value = texture2D(data, coords).r;
        bool isNotFinite = isnan(value) || isinf(value);

        if (isNotFinite || !isSupported(value)) {
          gl_FragColor = nanColor;
        } else {
          gl_FragColor = texture2D(colorMap, vec2(scale(value), 0.5));

          if (withAlpha == 1) {
            gl_FragColor.a = oneOverAlphaRange * (texture2D(alpha, coords).r - alphaMin);
          }
        }
      }
    `,
  };

  return (
    <VisMesh scale={[1, ordinateConfig.flip ? -1 : 1, 1]}>
      <shaderMaterial args={[shader]} />
    </VisMesh>
  );
}

export default memo(HeatmapMesh);
