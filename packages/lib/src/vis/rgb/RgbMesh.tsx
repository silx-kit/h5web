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
    uniforms: getUniforms({ data: dataTexture, bgr }),
    vertexShader: VERTEX_SHADER,
    fragmentShader: `
      uniform highp sampler3D data;
      uniform bool bgr;

      varying vec2 coords;

      void main() {
        float red = texture(data, vec3(0., coords)).r;
        float green = texture(data, vec3(0.5, coords)).r;
        float blue = texture(data, vec3(1., coords)).r;

        if (bgr) {
          gl_FragColor = vec4(blue, green, red, 1.);
        } else {
          gl_FragColor = vec4(red, green, blue, 1.);
        }
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
