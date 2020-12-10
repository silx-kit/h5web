import React, { ReactElement } from 'react';
import { useLoader } from 'react-three-fiber';
import { TextureLoader } from 'three';
import { GLYPH_URLS } from './models';

interface Props {
  color: string;
  size: number;
  glyphURL?: string;
}

function GlyphMaterial(props: Props): ReactElement {
  const { color, size, glyphURL } = props;
  const sprite = useLoader(TextureLoader, glyphURL || GLYPH_URLS.Cross);

  return (
    <pointsMaterial
      attach="material"
      map={sprite}
      color={color}
      size={size}
      transparent
    />
  );
}

export default GlyphMaterial;
