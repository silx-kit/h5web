import type { NdArray } from 'ndarray';
import { useMemo } from 'react';

import VisMesh from '../shared/VisMesh';
import { getUniforms, VERTEX_SHADER } from '../utils';
import { getDataTexture3D } from './utils';

interface Props {
  values: NdArray<Uint8Array | Uint8ClampedArray | Float32Array>;
  bgr?: boolean;
}

function RgbMesh(props: Props) {
  const { values, bgr = false } = props;

  const dataTexture = useMemo(() => getDataTexture3D(values), [values]);

  const shader = {
    uniforms: getUniforms({ data: dataTexture, bgr }),
    vertexShader: VERTEX_SHADER,
    fragmentShader: `
      uniform highp sampler3D data;
      uniform bool bgr;

      varying vec2 coords;

      void main() {
        float yFlipped = 1. - coords.y;

        float red = texture(data, vec3(0., coords.x, yFlipped)).r;
        float green = texture(data, vec3(0.5, coords.x, yFlipped)).r;
        float blue = texture(data, vec3(1., coords.x, yFlipped)).r;

        if (bgr) {
          gl_FragColor = vec4(blue, green, red, 1.);
        } else {
          gl_FragColor = vec4(red, green, blue, 1.);
        }
      }
    `,
  };

  return (
    <VisMesh>
      <shaderMaterial args={[shader]} />
    </VisMesh>
  );
}

export default RgbMesh;
