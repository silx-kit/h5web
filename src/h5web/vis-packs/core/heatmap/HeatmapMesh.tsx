import { rgb } from 'd3-color';
import { isArray } from 'lodash';
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
import { isScaleType } from '../utils';
import type { ColorMap, ScaleParams } from './models';
import { getInterpolator } from './utils';

interface Props {
  rows: number;
  cols: number;
  values: number[];
  domain: Domain;
  colorMap: ColorMap;
  scaleType: ScaleParams;
  invertColorMap?: boolean;
  alphaValues?: number[];
  alphaDomain?: Domain;
}

const CMAP_SIZE = 256;

function computeScaledDomain(
  scaleType: Omit<ScaleType, 'gamma'> | ScaleType.Gamma,
  domain: Domain
): Domain {
  switch (scaleType) {
    case ScaleType.Linear:
    case ScaleType.Gamma:
      return domain;

    case ScaleType.Log:
      return domain.map(Math.log10) as Domain;

    case ScaleType.Sqrt:
      return domain.map(Math.sqrt) as Domain;

    case ScaleType.SymLog:
      return domain.map(
        (val) => Math.sign(val) * Math.log10(1 + Math.abs(val))
      ) as Domain;
    default:
      throw new Error('Unknown scaleType');
  }
}

const SCALE_SHADER: Record<ScaleType, string> = {
  [ScaleType.Linear]: `
    float scale(float value) {
      return oneOverRange * (value - min); // Linear
    }

    bool isSupported(float value) {
      return true;
    }`,
  [ScaleType.Log]: `
    const float oneOverLog10 = 0.43429448190325176;

    float scale(float value) {
      return oneOverRange * (log(value) * oneOverLog10 - min); // Log
    }

    bool isSupported(float value) {
      return value > 0.;
    }`,
  [ScaleType.SymLog]: `
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
  [ScaleType.Sqrt]: `
    float scale(float value) {
      return oneOverRange * (sqrt(value) - min);
    }

    bool isSupported(float value) {
      return value >= 0.;
    }`,
  [ScaleType.Gamma]: `
    uniform float gammaExponent;

    float scale(float value) {
      return pow(oneOverRange * (value - min), gammaExponent);
    }

    bool isSupported(float value) {
      return true;
    }`,
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
  const scaledDomain = computeScaledDomain(
    isArray(scaleType) ? scaleType[0] : scaleType,
    domain
  );

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

  const { ordinateConfig } = useAxisSystemContext();
  const shader = {
    uniforms: {
      data: { value: dataTexture },
      withAlpha: { value: alphaValues ? 1 : 0 },
      alpha: { value: alphaTexture },
      colorMap: { value: colorMapTexture },
      min: { value: scaledDomain[0] },
      alphaMin: { value: alphaDomain && alphaDomain[0] },
      oneOverRange: { value: 1 / (scaledDomain[1] - scaledDomain[0]) },
      oneOverAlphaRange: {
        value: alphaDomain && 1 / (alphaDomain[1] - alphaDomain[0]),
      },
      gammaExponent: {
        value: isArray(scaleType) ? scaleType[1] : undefined,
      },
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
      uniform float min;
      uniform float alphaMin;
      uniform float oneOverRange;
      uniform sampler2D alpha;
      uniform float oneOverAlphaRange;
      uniform int withAlpha;

      const vec4 nanColor = vec4(255, 255, 255, 1);

      varying vec2 coords;

      ${SCALE_SHADER[isScaleType(scaleType) ? scaleType : ScaleType.Gamma]}

      void main() {
        float value = texture2D(data, coords).r;

        if (!isSupported(value)) {
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
