import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import type { BufferGeometry, Vector3 } from 'three';
import GlyphMaterial from './GlyphMaterial';
import { GLYPH_URLS } from './models';

interface Props {
  capsPoints: Vector3[];
  barsSegments: Vector3[];
  color: string;
  visible?: boolean;
}

function ErrorBars(props: Props) {
  const { barsSegments, capsPoints, color, visible } = props;
  const invalidate = useThree((state) => state.invalidate);

  const barsGeometry = useRef<BufferGeometry>(null);
  useLayoutEffect(() => {
    barsGeometry.current?.setFromPoints(barsSegments);
    invalidate();
  }, [barsGeometry, barsSegments, invalidate]);

  const capsGeometry = useRef<BufferGeometry>(null);
  useLayoutEffect(() => {
    capsGeometry.current?.setFromPoints(capsPoints);
    invalidate();
  }, [capsGeometry, capsPoints, invalidate]);

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
