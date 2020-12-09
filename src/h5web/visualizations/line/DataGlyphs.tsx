import React, { ReactElement } from 'react';
import { useLoader } from 'react-three-fiber';
import { TextureLoader, BufferGeometry } from 'three';
import { GLYPH_URLS } from './models';

interface Props {
  geometry: BufferGeometry;
  color: string;
  size: number;
  glyphURL?: string;
  visible?: boolean;
}

function DataGlyphs(props: Props): ReactElement {
  const { geometry, color, size, glyphURL, visible } = props;
  const sprite = useLoader(TextureLoader, glyphURL || GLYPH_URLS.Cross);

  return (
    <points visible={visible} geometry={geometry}>
      <pointsMaterial
        attach="material"
        map={sprite}
        color={color}
        size={size}
        transparent
      />
    </points>
  );
}

export default DataGlyphs;
