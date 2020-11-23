import React, { ReactElement } from 'react';
import { useLoader } from 'react-three-fiber';
import { TextureLoader, BufferGeometry } from 'three';
import { GLYPH_URLS } from './models';

interface Props {
  geometry: BufferGeometry;
  color: string;
  glyphURL?: string;
  visible: boolean;
}

function DataGlyphs(props: Props): ReactElement {
  const { geometry, color, glyphURL, visible } = props;
  const sprite = useLoader(TextureLoader, glyphURL || GLYPH_URLS.Cross);

  return (
    <points visible={visible} geometry={geometry}>
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
