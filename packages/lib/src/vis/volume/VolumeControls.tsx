import { useThree } from '@react-three/fiber';
import { type RefObject, useEffect } from 'react';
import { PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface Props {
  interactingRef: RefObject<boolean>;
}

const INITIAL_POSITION = [1.4, 1, 1.75] as const;

function VolumeControls(props: Props) {
  const { interactingRef } = props;

  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    camera.position.set(...INITIAL_POSITION);
    if (camera instanceof PerspectiveCamera) {
      camera.fov = 45;
      camera.near = 0.01;
      camera.updateProjectionMatrix();
    }

    const controls = new OrbitControls(camera, domElement);
    controls.minDistance = 0.1;
    controls.maxDistance = 10;
    controls.update();

    function handleStart() {
      interactingRef.current = true;
    }

    function handleChange() {
      invalidate();
    }

    function handleEnd() {
      interactingRef.current = false;
      invalidate(); // re-render at full quality
    }

    controls.addEventListener('start', handleStart);
    controls.addEventListener('change', handleChange);
    controls.addEventListener('end', handleEnd);
    invalidate();

    return () => {
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('change', handleChange);
      controls.removeEventListener('end', handleEnd);
      controls.dispose();
    };
  }, [camera, domElement, invalidate, interactingRef]);

  return null;
}

export default VolumeControls;
