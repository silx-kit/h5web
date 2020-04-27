import React, { useMemo } from 'react';
import { useThree } from 'react-three-fiber';
import { RGBFormat, MeshBasicMaterial, DataTexture } from 'three';
import { usePanZoom } from './hooks';

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

  const pointerHandlers = usePanZoom();

  return (
    <mesh material={material} {...pointerHandlers}>
      <planeBufferGeometry attach="geometry" args={[width, height]} />
    </mesh>
  );
}

export default Mesh;
