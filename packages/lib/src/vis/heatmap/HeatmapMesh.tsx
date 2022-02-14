import type { Domain } from '@h5web/shared';
import { ScaleType } from '@h5web/shared';
import { rgb } from 'd3-color';
import type { NdArray } from 'ndarray';
import { memo, useMemo } from 'react';
import type { TextureFilter } from 'three';
import { DataTexture, RGBFormat, UnsignedByteType } from 'three';

import { useAxisSystemContext } from '../..';
import type { VisScaleType } from '../models';
import VisMesh from '../shared/VisMesh';
import { DEFAULT_DOMAIN, getUniforms } from '../utils';
import type { ColorMap, TextureSafeTypedArray } from './models';
import { getDataTexture, getInterpolator, scaleDomain } from './utils';

interface Props {
  values: NdArray<TextureSafeTypedArray | Uint16Array>; // uint16 values are treated as half floats
  domain: Domain;
  scaleType: VisScaleType;
  colorMap: ColorMap;
  invertColorMap?: boolean;
  magFilter?: TextureFilter;
  alphaValues?: NdArray<TextureSafeTypedArray | Uint16Array>; // uint16 values are treated as half floats
  alphaDomain?: Domain;
}

const CMAP_SIZE = 256;

const IMPL_SCALE: Partial<Record<ScaleType, string>> = {
  [ScaleType.Log]: 'log(value) * oneOverLog10',
  [ScaleType.SymLog]: 'sign(value) * log(1. + abs(value)) * oneOverLog10',
  [ScaleType.Sqrt]: 'sqrt(value)',
};

const IMPL_IS_SUPPORTED: Partial<Record<ScaleType, string>> = {
  [ScaleType.Log]: 'value > 0.',
  [ScaleType.Sqrt]: 'value >= 0.',
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

  const [scaleType, gammaExponent] = Array.isArray(visScaleType)
    ? visScaleType
    : [visScaleType as ScaleType, 1];

  const scaledDomain = scaleDomain(domain, scaleType);

  const shader = {
    uniforms: getUniforms({
      data: dataTexture,
      colorMap: colorMapTexture,
      min: scaledDomain[0],
      oneOverRange: 1 / (scaledDomain[1] - scaledDomain[0]),
      gammaExponent,
      normRevertFactor: values.dtype === 'uint8' ? 255 : 1, // revert WebGL's automatic normalization of UNSIGNED_BYTE with RED format
      alpha: alphaTexture,
      withAlpha: alphaValues ? 1 : 0,
      alphaMin: alphaDomain[0],
      oneOverAlphaRange: 1 / (alphaDomain[1] - alphaDomain[0]),
    }),
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
      uniform float normRevertFactor;

      uniform sampler2D alpha;
      uniform float alphaMin;
      uniform float oneOverAlphaRange;
      uniform int withAlpha;

      const vec4 nanColor = vec4(255, 255, 255, 1);
      const float oneOverLog10 = 0.43429448190325176;

      varying vec2 coords;

      bool isSupported(float value) {
        return ${IMPL_IS_SUPPORTED[scaleType] || 'true'};
      }

      float scale(float value) {
        return ${IMPL_SCALE[scaleType] || 'value'};
      }

      void main() {
        float value = texture2D(data, coords).r * normRevertFactor;

        if (isnan(value) || isinf(value) || !isSupported(value)) {
          gl_FragColor = nanColor;
        } else {
          float scaledValue = scale(value);
          float normalizedValue = clamp(oneOverRange * (scaledValue - min), 0., 1.);

          gl_FragColor = texture2D(colorMap, vec2(pow(normalizedValue, gammaExponent), 0.5));

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
