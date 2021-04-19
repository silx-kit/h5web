import { useLayoutEffect, useRef } from 'react';
import type { BufferGeometry, Vector2, Vector3 } from 'three';
import GlyphMaterial from './GlyphMaterial';
import { GLYPH_URLS } from './models';

interface Props {
  capsPoints: Vector3[] | Vector2[];
  barsSegments: Vector3[] | Vector2[];
  color: string;
  visible?: boolean;
}

function ErrorBars(props: Props) {
  const { barsSegments, capsPoints, color, visible } = props;

  const barsGeometry = useRef<BufferGeometry>(null);
  useLayoutEffect(() => {
    barsGeometry.current?.setFromPoints(barsSegments);
  }, [barsGeometry, barsSegments]);

  const capsGeometry = useRef<BufferGeometry>(null);
  useLayoutEffect(() => {
    capsGeometry.current?.setFromPoints(capsPoints);
  }, [capsGeometry, capsPoints]);

  return (
    <>
      <lineSegments visible={visible}>
        <lineBasicMaterial color={color} linewidth={2} />
        <bufferGeometry ref={barsGeometry} />
      </lineSegments>
      <points visible={visible}>
        <GlyphMaterial glyphURL={GLYPH_URLS.Cap} color={color} size={9} />
        <bufferGeometry ref={capsGeometry} />
      </points>
    </>
  );
}

export default ErrorBars;
