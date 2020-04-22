import React, { useMemo } from 'react';
import { useThree, useFrame } from 'react-three-fiber';
import { RGBFormat, MeshBasicMaterial, DataTexture } from 'three';
import { usePanZoom } from './hooks';

interface Props {
  dims: [number, number];
  textureData: Uint8Array;
  axisOffsets: [number, number];
}

function Mesh(props: Props): JSX.Element {
  const { dims, textureData, axisOffsets } = props;

  const { gl, size } = useThree();
  const { width, height } = size;
  const [leftAxisWidth, bottomAxisHeight] = axisOffsets;

  useFrame(() => {
    /*
     * Set viewport of WebGL renderer to allow camera-related computations to be performed
     * as if axis didn't exist and mesh filled entire canvas.
     */
    gl.setViewport(
      leftAxisWidth,
      bottomAxisHeight,
      width - leftAxisWidth,
      height - bottomAxisHeight
    );
  });

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
