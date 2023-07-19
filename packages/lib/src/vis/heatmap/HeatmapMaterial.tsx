import type { Domain } from '@h5web/shared';
import { ScaleType } from '@h5web/shared';
import type { RGBColor } from 'd3-color';
import { rgb } from 'd3-color';
import type { NdArray } from 'ndarray';
import { memo, useMemo } from 'react';
import type { TextureFilter } from 'three';
import {
  DataTexture,
  DoubleSide,
  RGBAFormat,
  UnsignedByteType,
  Vector4,
} from 'three';

import type { VisScaleType } from '../models';
import type { VisMeshProps } from '../shared/VisMesh';
import { DEFAULT_DOMAIN, getUniforms, VERTEX_SHADER } from '../utils';
import { useDataTexture } from './hooks';
import type { ColorMap, TextureSafeTypedArray } from './models';
import { getInterpolator, scaleDomain } from './utils';

interface Props extends VisMeshProps {
  values: NdArray<TextureSafeTypedArray | Uint16Array>; // uint16 values are treated as half floats
  domain: Domain;
  scaleType: VisScaleType;
  colorMap: ColorMap;
  invertColorMap?: boolean;
  magFilter?: TextureFilter;
  alphaValues?: NdArray<TextureSafeTypedArray | Uint16Array>; // uint16 values are treated as half floats
  alphaDomain?: Domain;
  badColor?: RGBColor | string;
  mask?: NdArray<Uint8Array>;
}

const DEFAULT_BAD_COLOR = rgb(255, 255, 255, 0);

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

function HeatmapMaterial(props: Props) {
  const {
    values,
    domain,
    scaleType: visScaleType,
    colorMap,
    invertColorMap = false,
    magFilter,
    alphaValues,
    alphaDomain = DEFAULT_DOMAIN,
    badColor = DEFAULT_BAD_COLOR,
    mask,
  } = props;

  const dataTexture = useDataTexture(values, magFilter);
  const alphaTexture = useDataTexture(alphaValues);
  const maskTexture = useDataTexture(mask);

  const colorMapTexture = useMemo(() => {
    const interpolator = getInterpolator(colorMap, invertColorMap);

    const colors = Array.from({ length: CMAP_SIZE }).flatMap((_, i) => {
      const { r, g, b } = rgb(interpolator(i / (CMAP_SIZE - 1)));
      return [r, g, b, 255];
    });

    const texture = new DataTexture(
      Uint8Array.from(colors),
      CMAP_SIZE,
      1,
      RGBAFormat,
      UnsignedByteType,
    );
    texture.needsUpdate = true;

    return texture;
  }, [colorMap, invertColorMap]);

  const [scaleType, gammaExponent] = Array.isArray(visScaleType)
    ? visScaleType
    : [visScaleType as ScaleType, 1];

  const scaledDomain = scaleDomain(domain, scaleType);

  const badColorAsRgb = typeof badColor === 'string' ? rgb(badColor) : badColor;

  const shader = {
    uniforms: getUniforms({
      data: dataTexture,
      mask: maskTexture,
      colorMap: colorMapTexture,
      min: scaledDomain[0],
      oneOverRange: 1 / (scaledDomain[1] - scaledDomain[0]),
      gammaExponent,
      normRevertFactor: values.dtype === 'uint8' ? 255 : 1, // revert WebGL's automatic normalization of UNSIGNED_BYTE with RED format
      alpha: alphaTexture,
      withAlpha: alphaValues ? 1 : 0,
      alphaMin: alphaDomain[0],
      oneOverAlphaRange: 1 / (alphaDomain[1] - alphaDomain[0]),
      badColor: new Vector4(
        badColorAsRgb.r / 255,
        badColorAsRgb.g / 255,
        badColorAsRgb.b / 255,
        badColorAsRgb.opacity,
      ),
    }),
    vertexShader: VERTEX_SHADER,
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
      uniform vec4 badColor;

      uniform sampler2D mask;

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
        float maskValue = texture2D(mask, coords).r;

        if (isnan(value) || !isSupported(value) || maskValue == 1.) {
            gl_FragColor = badColor;
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

  return <shaderMaterial args={[shader]} side={DoubleSide} />;
}

export default memo(HeatmapMaterial);
