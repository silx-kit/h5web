import React, { useMemo } from 'react';
import { useThree } from 'react-three-fiber';
import { RGBFormat, MeshBasicMaterial, DataTexture } from 'three';
import { usePanZoom } from './hooks';

const AXIS_OFFSETS = [72, 36];

interface Props {
  dims: [number, number];
  textureData: Uint8Array;
}

function Mesh(props: Props): JSX.Element {
  const { dims, textureData } = props;

  const { size } = useThree();
  const { width, height } = size;

  const material = useMemo(() => {
    return new MeshBasicMaterial({
      map: new DataTexture(textureData, dims[1], dims[0], RGBFormat),
    });
  }, [dims, textureData]);

  const [leftAxisWidth, bottomAxisHeight] = AXIS_OFFSETS;
  const pointerHandlers = usePanZoom(leftAxisWidth, bottomAxisHeight);

  return (
    <mesh
      position={[leftAxisWidth / 2, bottomAxisHeight / 2, 0]}
      material={material}
      {...pointerHandlers}
    >
      <planeBufferGeometry
        attach="geometry"
        args={[width - leftAxisWidth, height - bottomAxisHeight]}
      />
    </mesh>
  );
}

export default Mesh;
