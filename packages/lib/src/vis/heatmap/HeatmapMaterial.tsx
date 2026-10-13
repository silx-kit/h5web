import { type Domain, type ScaleType } from '@h5web/shared/vis-models';
import { rgb, type RGBColor } from 'd3-color';
import { type NdArray } from 'ndarray';
import { memo, useMemo } from 'react';
import {
  DoubleSide,
  type MagnificationTextureFilter,
  type MinificationTextureFilter,
  Vector4,
} from 'three';

import { type VisScaleType } from '../models';
import { type VisMeshProps } from '../shared/VisMesh';
import { DEFAULT_DOMAIN, getUniforms, VERTEX_SHADER } from '../utils';
import { useDataTexture } from './hooks';
import { type ColorMap, type TextureSafeTypedArray } from './models';
import {
  getColorMapTexture,
  GLSL_IS_SUPPORTED,
  GLSL_SCALE,
  scaleDomain,
} from './utils';

interface Props extends VisMeshProps {
  values: NdArray<TextureSafeTypedArray>;
  domain: Domain;
  scaleType: VisScaleType;
  colorMap: ColorMap;
  invertColorMap?: boolean;
  alphaValues?: NdArray<TextureSafeTypedArray>;
  alphaDomain?: Domain;
  badColor?: RGBColor | string;
  magFilter?: MagnificationTextureFilter;
  minFilter?: MinificationTextureFilter;
  mask?: NdArray<Uint8Array>;
}

const DEFAULT_BAD_COLOR = rgb(255, 255, 255, 0);

function HeatmapMaterial(props: Props) {
  const {
    values,
    domain,
    scaleType: visScaleType,
    colorMap,
    invertColorMap = false,
    alphaValues,
    alphaDomain = DEFAULT_DOMAIN,
    badColor = DEFAULT_BAD_COLOR,
    magFilter,
    minFilter,
    mask,
  } = props;

  const dataTexture = useDataTexture(values, magFilter, minFilter);
  const alphaTexture = useDataTexture(alphaValues);
  const maskTexture = useDataTexture(mask);

  const colorMapTexture = useMemo(
    () => getColorMapTexture(colorMap, invertColorMap),
    [colorMap, invertColorMap],
  );

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
        return ${GLSL_IS_SUPPORTED[scaleType] || 'true'};
      }

      float scale(float value) {
        return ${GLSL_SCALE[scaleType] || 'value'};
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
