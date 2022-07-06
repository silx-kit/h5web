import { Color } from 'three';

import { getUniforms } from '../utils';
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

  // If no `color` given, use vertex colors (i.e. buffer attribute on geometry)
  const withVertexColor = !color;

  const shader = {
    uniforms: getUniforms({ size, color: new Color(color) }),
    vertexShader: `
      ${color ? 'uniform vec3 color;' : ''}
      uniform float size;
      varying vec3 vertexColor;

      void main() {
        gl_PointSize = size;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        vertexColor = color;
      }
    `,
    fragmentShader: `
      uniform float size;
      varying vec3 vertexColor;

      ${GLYPH_SHADERS[glyphType]}

      void main() {
        float alpha = alphaSymbol(gl_PointCoord, size);
        if (alpha <= 0.0) {
            discard;
        } else {
            gl_FragColor = vec4(vertexColor.rgb, alpha);
        }
      }
    `,
  };

  return <shaderMaterial args={[shader]} vertexColors={withVertexColor} />;
}

export default GlyphMaterial;
