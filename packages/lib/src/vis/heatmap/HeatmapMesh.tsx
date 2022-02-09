import type { Domain } from '@h5web/shared';
import { ScaleType, isScaleType } from '@h5web/shared';
import { rgb } from 'd3-color';
import type { NdArray } from 'ndarray';
import { memo, useMemo } from 'react';
import type { TextureFilter } from 'three';
import { DataTexture, RGBFormat, UnsignedByteType } from 'three';

import { useAxisSystemContext } from '../..';
import type { VisScaleType } from '../models';
import VisMesh from '../shared/VisMesh';
import { DEFAULT_DOMAIN } from '../utils';
import type { ColorMap } from './models';
import { getDataTexture, getInterpolator, scaleDomain } from './utils';

interface Props {
  values: NdArray<Float32Array | Uint16Array>; // if `Uint16Array`, it must contain half floats
  domain: Domain;
  scaleType: VisScaleType;
  colorMap: ColorMap;
  invertColorMap?: boolean;
  magFilter?: TextureFilter;
  alphaValues?: NdArray<Float32Array | Uint16Array>; // if `Uint16Array`, it must contain half floats
  alphaDomain?: Domain;
}

const CMAP_SIZE = 256;

const SCALE_SHADER: Record<ScaleType, string> = {
  [ScaleType.Linear]: `
    float scale(float value) {
      return oneOverRange * (value - min);
    }

    bool isSupported(float value) {
      return true;
    }`,
  [ScaleType.Log]: `
    float scale(float value) {
      return oneOverRange * (log(value) * oneOverLog10 - min);
    }

    bool isSupported(float value) {
      return value > 0.;
    }`,
  [ScaleType.SymLog]: `
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
    float scale(float value) {
      return pow(oneOverRange * (value - min), gammaExponent);
    }

    bool isSupported(float value) {
      return true;
    }`,
};

function HeatmapMesh(props: Props) {
  const {
    values,
    domain,
    scaleType: visScaleType,
    colorMap,
    invertColorMap = false,
    magFilter,
    alphaValues,
    alphaDomain = DEFAULT_DOMAIN,
  } = props;

  const { ordinateConfig } = useAxisSystemContext();

  const dataTexture = useMemo(
    () => getDataTexture(values, magFilter),
    [magFilter, values]
  );

  const alphaTexture = useMemo(
    () => alphaValues && getDataTexture(alphaValues),
    [alphaValues]
  );

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

  const [scaleType, gammaExponent] = isScaleType(visScaleType)
    ? [visScaleType]
    : visScaleType;

  const scaledDomain = scaleDomain(domain, scaleType as ScaleType);

  const shader = {
    uniforms: {
      data: { value: dataTexture },
      colorMap: { value: colorMapTexture },
      min: { value: scaledDomain[0] },
      oneOverRange: { value: 1 / (scaledDomain[1] - scaledDomain[0]) },
      gammaExponent: { value: gammaExponent },
      alpha: { value: alphaTexture },
      withAlpha: { value: alphaValues ? 1 : 0 },
      alphaMin: { value: alphaDomain[0] },
      oneOverAlphaRange: {
        value: 1 / (alphaDomain[1] - alphaDomain[0]),
      },
    },
    vertexShader: `
      varying vec2 coords;

      void main() {
        coords = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D data;
      uniform sampler2D colorMap;

      uniform float min;
      uniform float oneOverRange;
      uniform float gammaExponent;

      uniform sampler2D alpha;
      uniform float alphaMin;
      uniform float oneOverAlphaRange;
      uniform int withAlpha;

      const vec4 nanColor = vec4(255, 255, 255, 1);
      const float oneOverLog10 = 0.43429448190325176;

      varying vec2 coords;

      ${SCALE_SHADER[isScaleType(scaleType) ? scaleType : ScaleType.Gamma]}

      void main() {
        float value = texture2D(data, coords).r;

        if (isnan(value) || isinf(value) || !isSupported(value)) {
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

export type { Props as HeatmapMeshProps };
export default memo(HeatmapMesh);
