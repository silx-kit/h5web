import { useLoader } from '@react-three/fiber';
import { NearestFilter, TextureLoader } from 'three';
import { GLYPH_URLS } from './models';

interface Props {
  color: string;
  size: number;
  glyphURL?: string;
}

function GlyphMaterial(props: Props) {
  const { color, size, glyphURL } = props;
  const sprite = useLoader(TextureLoader, glyphURL || GLYPH_URLS.Cross);
  sprite.magFilter = NearestFilter;

  return <pointsMaterial map={sprite} color={color} size={size} transparent />;
}

export default GlyphMaterial;
