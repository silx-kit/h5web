import { Color } from 'three';

import { GlyphType } from './models';

interface Props {
  color?: string;
  size: number;
  glyphType: GlyphType;
}

// From https://github.com/silx-kit/silx/blob/11f764176ede6ad68d7551e215773a47bcb4614d/src/silx/gui/plot/backends/glutils/GLPlotCurve.py#L581-L799
const GLYPH_SHADERS = {
  [GlyphType.Cross]: `
    float alphaSymbol(vec2 coord, float size) {
      vec2 pos = floor(size * coord) + 0.5;
      vec2 d_x = abs(pos.x + vec2(- pos.y, pos.y - size));
      if (min(d_x.x, d_x.y) <= 0.5) {
          return 1.0;
      } else {
          return 0.0;
      }
    }
  `,
  [GlyphType.Cap]: `
    float alphaSymbol(vec2 coord, float size) {
      float dy = abs(size * (coord.y - 0.5));
      if (dy < 0.5) {
          return 1.0;
      } else {
          return 0.0;
      }
    }
  `,
  [GlyphType.Circle]: `
    float alphaSymbol(vec2 coord, float size) {
      float r = distance(coord, vec2(0.5, 0.5));
      if( r < 0.5) {
        return 1.0;
      } else {
        return 0.0;
      }
    }
  `,
  [GlyphType.Square]: `
    float alphaSymbol(vec2 coord, float size) {
      return 1.0;
    }
  `,
};

function GlyphMaterial(props: Props) {
  const { color, size, glyphType } = props;

  const shader = {
    uniforms: {
      size: { value: size },
    },
    vertexShader: `
      uniform float size;
      varying vec3 vColor;

      void main() {
        vColor = color;
        gl_PointSize = size;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      uniform float size;

      ${GLYPH_SHADERS[glyphType]}

      void main() {
        float alpha = alphaSymbol(gl_PointCoord, size);
        if (alpha <= 0.0) {
            discard;
        } else {
            gl_FragColor = vec4(vColor.rgb, alpha);
        }
      }
    `,
  };

  if (color) {
    // If color is given, make it a uniform in the shader
    return (
      <shaderMaterial
        uniforms={{ color: { value: new Color(color) }, ...shader.uniforms }}
        vertexShader={`uniform vec3 color; ${shader.vertexShader}`}
        fragmentShader={shader.fragmentShader}
      />
    );
  }

  // If not, use vertex colors
  return <shaderMaterial args={[shader]} vertexColors />;
}

export default GlyphMaterial;
