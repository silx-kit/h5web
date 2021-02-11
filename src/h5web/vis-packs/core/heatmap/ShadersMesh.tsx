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
import type { Domain } from '../models';
import { INTERPOLATORS } from './interpolators';
import type { ColorMap } from './models';

interface Props {
  rows: number;
  cols: number;
  values: number[];
  domain: Domain;
  colorMap: ColorMap;
}

const CMAP_SIZE = 256;

function ShadersMesh(props: Props): ReactElement {
  const { rows, cols, values, domain, colorMap } = props;

  const dataTexture = useMemo(() => {
    const valuesArr = Float32Array.from(values);
    return new DataTexture(valuesArr, cols, rows, RedFormat, FloatType);
  }, [cols, rows, values]);

  const colorMapTexture = useMemo(() => {
    const interpolator = INTERPOLATORS[colorMap];

    const colors = Uint8Array.from(
      Array.from({ length: CMAP_SIZE }).flatMap((_, i) => {
        const { r, g, b } = rgb(interpolator(i / (CMAP_SIZE - 1)));
        return [r, g, b];
      })
    );

    return new DataTexture(colors, CMAP_SIZE, 1, RGBFormat, UnsignedByteType);
  }, [colorMap]);

  const shader = {
    uniforms: {
      data: { value: dataTexture },
      colorMap: { value: colorMapTexture },
      min: { value: domain[0] },
      oneOverRange: { value: 1 / (domain[1] - domain[0]) },
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
      uniform float min;
      uniform float oneOverRange;

      varying vec2 coords;

      void main() {
        float value = texture(data, coords).r;
        float normalizedValue = clamp(oneOverRange * (value - min), 0., 1.);
        gl_FragColor = texture(colorMap, vec2(normalizedValue, 0.5));
      }
    `,
  };

  const { size } = useThree();
  const { width, height } = size;

  return (
    <mesh scale={[width, height, 1]}>
      <planeGeometry attach="geometry" args={[1, 1]} />
      <shaderMaterial attach="material" args={[shader]} />
    </mesh>
  );
}

export default memo(ShadersMesh);
