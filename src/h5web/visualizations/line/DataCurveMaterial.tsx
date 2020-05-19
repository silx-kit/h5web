import React from 'react';
import { useLoader } from 'react-three-fiber';
import { TextureLoader } from 'three';
import { SpriteGlyph, Glyph } from './models';
import circleURL from './sprites/circle.png';
import crossURL from './sprites/cross.png';
import squareURL from './sprites/square.png';

const GLYPH_URLS = {
  [Glyph.Circle]: circleURL,
  [Glyph.Cross]: crossURL,
  [Glyph.Square]: squareURL,
};

interface Props {
  color: string;
  glyph: SpriteGlyph;
}

function DataCurveMaterial(props: Props): JSX.Element {
  const { color, glyph } = props;
  const sprite = useLoader(TextureLoader, GLYPH_URLS[glyph]);

  return (
    <pointsMaterial
      attach="material"
      map={sprite}
      color={color}
      size={6}
      transparent
    />
  );
}

export default DataCurveMaterial;
