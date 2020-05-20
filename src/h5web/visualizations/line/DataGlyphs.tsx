import React from 'react';
import { useLoader } from 'react-three-fiber';
import { TextureLoader, BufferGeometry } from 'three';
import { GLYPH_URLS } from './models';

interface Props {
  geometry: BufferGeometry;
  color: string;
  glyphURL?: string;
}

function DataGlyphs(props: Props): JSX.Element {
  const { geometry, color, glyphURL } = props;
  const sprite = useLoader(TextureLoader, glyphURL || GLYPH_URLS.Cross);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        attach="material"
        map={sprite}
        color={color}
        size={6}
        transparent
      />
    </points>
  );
}

export default DataGlyphs;
