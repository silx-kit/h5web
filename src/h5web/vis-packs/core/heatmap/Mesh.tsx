import { rgb } from 'd3-color';
import { ReactElement, memo, useMemo } from 'react';
import { useThree } from 'react-three-fiber';
import {
  DataTexture,
  FloatType,
  RedFormat,
  RGBFormat,
  UnsignedByteType,
} from 'three';
import { Domain, ScaleType } from '../models';
import type { ColorMap } from './models';
import { getInterpolator } from './utils';

interface Props {
  rows: number;
  cols: number;
  values: number[];
  domain: Domain;
  colorMap: ColorMap;
  scaleType: ScaleType;
  invertColorMap?: boolean;
}

const SCALE_FUNC: Record<ScaleType, (val: number) => number> = {
  [ScaleType.Linear]: (val) => val,
  [ScaleType.Log]: Math.log10,
  [ScaleType.SymLog]: (val) => {
    return Math.sign(val) * Math.log10(1 + Math.abs(val));
  },
};

const CMAP_SIZE = 256;
const CMAP_NORM: Record<ScaleType, number> = {
  [ScaleType.Linear]: 0,
  [ScaleType.Log]: 1,
  [ScaleType.SymLog]: 2,
};

function Mesh(props: Props): ReactElement {
  const {
    rows,
    cols,
    values,
    domain,
    colorMap,
    scaleType,
    invertColorMap = false,
  } = props;

  const scaledDomain = domain.map(SCALE_FUNC[scaleType]);

  const dataTexture = useMemo(() => {
    const valuesArr = Float32Array.from(values);
    return new DataTexture(valuesArr, cols, rows, RedFormat, FloatType);
  }, [cols, rows, values]);

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

  const shader = {
    uniforms: {
      data: { value: dataTexture },
      colorMap: { value: colorMapTexture },
      scaleType: { value: CMAP_NORM[scaleType] },
      min: { value: scaledDomain[0] },
      oneOverRange: { value: 1 / (scaledDomain[1] - scaledDomain[0]) },
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
      uniform float oneOverRange;

      const float oneOverLog10 = 0.43429448190325176;
      const vec4 nanColor = vec4(255, 255, 255, 1);

      varying vec2 coords;

      float symlog(float x) {
        return sign(x) * log(1. + abs(x)) * oneOverLog10;
      }

      float scale(float value) {
        if (scaleType == 1) {
          return oneOverRange * (log(value) * oneOverLog10 - min); // Log
        }

        if (scaleType == 2) {
          return oneOverRange * (symlog(value) - min); // SymLog
        }

        return oneOverRange * (value - min); // Linear
      }

      void main() {
        float value = texture(data, coords).r;

        if (scaleType == 1 && value <= 0.) {
          gl_FragColor = nanColor;
        } else {
          gl_FragColor = texture(colorMap, vec2(scale(value), 0.5));
        }
      }
    `,
  };

  const { size } = useThree();
  const { width, height } = size;

  return (
    <mesh>
      <planeGeometry attach="geometry" args={[width, height]} />
      <shaderMaterial attach="material" args={[shader]} />
    </mesh>
  );
}

export default memo(Mesh);
