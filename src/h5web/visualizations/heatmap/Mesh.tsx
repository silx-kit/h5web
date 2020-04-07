import React from 'react';
import { useThree } from 'react-three-fiber';
import { RGBFormat, OrthographicCamera } from 'three';
import { usePanZoom } from './utils';

interface Props {
  dims: [number, number];
  textureData: Uint8Array;
}

function Mesh(props: Props): JSX.Element {
  const { dims, textureData } = props;
  const [rows, cols] = dims;

  const { camera, size } = useThree();
  const { width, height } = size;

  const pointerHandlers = usePanZoom(camera as OrthographicCamera);

  return (
    <mesh {...pointerHandlers}>
      <planeBufferGeometry attach="geometry" args={[width, height]} />
      <meshBasicMaterial attach="material">
        <dataTexture attach="map" args={[textureData, cols, rows, RGBFormat]} />
      </meshBasicMaterial>
    </mesh>
  );
}

export default Mesh;
