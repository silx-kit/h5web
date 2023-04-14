import { type BufferGeometry } from 'three';

import GlyphMaterial from './GlyphMaterial';
import { GlyphType } from './models';

export interface ErrorGeometries {
  bars: BufferGeometry;
  caps: BufferGeometry;
}

interface Props {
  geometries: ErrorGeometries;
  color: string;
  visible?: boolean;
}

function ErrorBars(props: Props) {
  const { geometries, color, visible } = props;

  return (
    <>
      <lineSegments geometry={geometries.bars} visible={visible}>
        <lineBasicMaterial color={color} />
      </lineSegments>
      <points geometry={geometries.caps} visible={visible}>
        <GlyphMaterial glyphType={GlyphType.Cap} color={color} size={9} />
      </points>
    </>
  );
}

export default ErrorBars;
