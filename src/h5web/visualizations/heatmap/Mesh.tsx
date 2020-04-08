import React from 'react';
import { useThree } from 'react-three-fiber';
import { RGBFormat } from 'three';
import { usePanZoom } from './utils';

interface Props {
  dims: [number, number];
  textureData: Uint8Array;
}

function Mesh(props: Props): JSX.Element {
  const { dims, textureData } = props;

  const { size } = useThree();
  const pointerHandlers = usePanZoom();

  const { width, height } = size;
  const [rows, cols] = dims;

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
