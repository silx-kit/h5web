import { getDims } from '@h5web/shared';
import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useState } from 'react';
import { BufferGeometry, DoubleSide } from 'three';

import { useDataToColorScale } from '../hooks';
import GlyphMaterial from '../line/GlyphMaterial';
import { GlyphType } from '../line/models';
import type { SurfaceVisProps } from './SurfaceVis';
import { useBufferAttributes } from './hooks';

type Props = Required<SurfaceVisProps>;

function SurfaceMesh(props: Props) {
  const { dataArray, domain, colorMap, invertColorMap, scaleType, showPoints } =
    props;

  const { rows, cols } = getDims(dataArray);

  const [dataGeometry] = useState(() => new BufferGeometry());
  const invalidate = useThree((state) => state.invalidate);

  const dataToColorScale = useDataToColorScale(
    scaleType,
    domain,
    colorMap,
    invertColorMap
  );

  const {
    position,
    color,
    index: indices,
  } = useBufferAttributes(dataArray, dataToColorScale);

  useLayoutEffect(() => {
    dataGeometry.setAttribute('position', position);
    dataGeometry.setAttribute('color', color);
    dataGeometry.setIndex(indices);
    invalidate();
  }, [dataGeometry, invalidate, position, indices, color]);

  return (
    <group position={[-cols / 2, -rows / 2, 0]}>
      <mesh geometry={dataGeometry}>
        <meshBasicMaterial vertexColors side={DoubleSide} />
      </mesh>
      {showPoints && (
        <points geometry={dataGeometry}>
          <GlyphMaterial size={5} glyphType={GlyphType.Circle} color="black" />
        </points>
      )}
    </group>
  );
}

export default SurfaceMesh;
