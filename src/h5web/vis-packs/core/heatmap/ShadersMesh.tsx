import { ReactElement, memo } from 'react';
import { useThree } from 'react-three-fiber';
import { DataTexture, FloatType, RedFormat } from 'three';
import type { Domain } from '../models';

interface Props {
  rows: number;
  cols: number;
  values: number[];
  domain: Domain;
}

function ShadersMesh(props: Props): ReactElement {
  const { rows, cols, values, domain } = props;

  const shader = {
    uniforms: {
      data: {
        value: new DataTexture(
          Float32Array.from(values),
          cols,
          rows,
          RedFormat,
          FloatType
        ),
      },
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
      uniform float min;
      uniform float oneOverRange;

      varying vec2 coords;

      vec3 inferno(float t) {
        const vec3 c0 = vec3(0.0002189403691192265, 0.001651004631001012, -0.01948089843709184);
        const vec3 c1 = vec3(0.1065134194856116, 0.5639564367884091, 3.932712388889277);
        const vec3 c2 = vec3(11.60249308247187, -3.972853965665698, -15.9423941062914);
        const vec3 c3 = vec3(-41.70399613139459, 17.43639888205313, 44.35414519872813);
        const vec3 c4 = vec3(77.162935699427, -33.40235894210092, -81.80730925738993);
        const vec3 c5 = vec3(-71.31942824499214, 32.62606426397723, 73.20951985803202);
        const vec3 c6 = vec3(25.13112622477341, -12.24266895238567, -23.07032500287172);

        return c0+t*(c1+t*(c2+t*(c3+t*(c4+t*(c5+t*c6)))));
      }

      void main() {
        float value = texture2D(data, coords).r;
        float normalizedValue = clamp(oneOverRange * (value - min), 0., 1.);
        gl_FragColor = vec4(inferno(normalizedValue), 1.);
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
