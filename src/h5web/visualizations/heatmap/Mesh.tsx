import React, { useMemo, ReactElement } from 'react';
import { useThree } from 'react-three-fiber';
import { RGBFormat, MeshBasicMaterial, DataTexture } from 'three';
import { usePanZoom, useProps, useTextureData } from './hooks';

function Mesh(): ReactElement {
  const { dims } = useProps();

  const { size } = useThree();
  const { width, height } = size;

  const textureData = useTextureData();
  const material = useMemo(() => {
    return (
      textureData &&
      new MeshBasicMaterial({
        map: new DataTexture(textureData, dims[1], dims[0], RGBFormat),
      })
    );
  }, [dims, textureData]);

  const pointerHandlers = usePanZoom();

  if (!material) {
    return <></>;
  }

  return (
    <mesh material={material} {...pointerHandlers}>
      <planeBufferGeometry attach="geometry" args={[width, height]} />
    </mesh>
  );
}

export default Mesh;
