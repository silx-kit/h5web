import { type NdArray } from 'ndarray';
import { useMemo } from 'react';

import VisMesh, { type VisMeshProps } from '../shared/VisMesh';
import { getUniforms, VERTEX_SHADER } from '../utils';
import { getData3DTexture } from './utils';

interface Props extends VisMeshProps {
  values: NdArray<Uint8Array | Uint8ClampedArray | Float32Array>;
  bgr?: boolean;
}

function RgbMesh(props: Props) {
  const { values, bgr = false, ...visMeshProps } = props;

  const dataTexture = useMemo(() => getData3DTexture(values), [values]);

  const shader = {
    uniforms: getUniforms({
      data: dataTexture,
      withAlpha: dataTexture.width === 4,
      bgr,
    }),
    vertexShader: VERTEX_SHADER,
    fragmentShader: `
      uniform highp sampler3D data;
      uniform bool withAlpha;
      uniform bool bgr;

      varying vec2 coords;

      void main() {
        float red = texture(data, vec3(0.0, coords)).r;
        float green = texture(data, vec3(mix(0.5, 0.3333, withAlpha), coords)).r;
        float blue = texture(data, vec3(mix(1.0, 0.6666, withAlpha), coords)).r;
        float alpha = mix(1.0, texture(data, vec3(1.0, coords)).r, withAlpha);

        gl_FragColor = vec4(
          mix(red, blue, bgr),
          green,
          mix(blue, red, bgr),
          alpha
        );
      }
    `,
  };

  return (
    <VisMesh {...visMeshProps}>
      <shaderMaterial args={[shader]} />
    </VisMesh>
  );
}

export default RgbMesh;
