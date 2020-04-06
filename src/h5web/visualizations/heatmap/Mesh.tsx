import React from 'react';
import { useThree, PointerEvent } from 'react-three-fiber';
import { RGBFormat, OrthographicCamera } from 'three';

const ZOOM_FACTOR = 0.95;

interface Props {
  dims: [number, number];
  textureData: Uint8Array;
}

function Mesh(props: Props): JSX.Element {
  const { dims, textureData } = props;
  const [rows, cols] = dims;

  const { size } = useThree();
  const { width, height } = size;

  function handleWheel(evt: PointerEvent): void {
    evt.stopPropagation();

    // Fix react-three-fiber typings
    const camera = evt.camera as OrthographicCamera;
    const wheelEvt = evt as React.WheelEvent<HTMLDivElement>;

    const factor = wheelEvt.deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    camera.zoom = Math.max(1, camera.zoom * factor);
    camera.updateProjectionMatrix();
  }

  return (
    <mesh onWheel={handleWheel}>
      <planeBufferGeometry attach="geometry" args={[width, height]} />
      <meshBasicMaterial attach="material">
        <dataTexture attach="map" args={[textureData, cols, rows, RGBFormat]} />
      </meshBasicMaterial>
    </mesh>
  );
}

export default Mesh;
