import React, { ReactElement } from 'react';
import { useUpdate } from 'react-three-fiber';
import type { BufferGeometry, Vector2, Vector3 } from 'three';
import GlyphMaterial from './GlyphMaterial';
import { GLYPH_URLS } from './models';

interface Props {
  capsPoints: Vector3[] | Vector2[];
  barsSegments: Vector3[] | Vector2[];
  color: string;
  visible?: boolean;
}

function ErrorBars(props: Props): ReactElement {
  const { barsSegments, capsPoints, color, visible } = props;

  const barsGeometry = useUpdate<BufferGeometry>(
    (geometry: BufferGeometry) => geometry.setFromPoints(barsSegments),
    [barsSegments]
  );
  const capsGeometry = useUpdate<BufferGeometry>(
    (geometry) => geometry.setFromPoints(capsPoints),
    [capsPoints]
  );

  return (
    <>
      <lineSegments visible={visible}>
        <lineBasicMaterial attach="material" color={color} linewidth={2} />
        <bufferGeometry attach="geometry" ref={barsGeometry} />
      </lineSegments>
      <points visible={visible}>
        <GlyphMaterial glyphURL={GLYPH_URLS.Cap} color={color} size={9} />
        <bufferGeometry attach="geometry" ref={capsGeometry} />
      </points>
    </>
  );
}

export default ErrorBars;
