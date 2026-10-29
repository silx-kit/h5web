import { useThree } from '@react-three/fiber';
import { type RefObject, useEffect } from 'react';
import { MOUSE } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface Props {
  resetRef: RefObject<(() => void) | undefined>;
}

function SurfaceControls(props: Props) {
  const { resetRef } = props;

  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    // Look at the surface from the front-left, slightly from above (z is up)
    camera.up.set(0, 0, 1); // before creating the controls, which rely on it
    camera.position.set(-0.45, -0.85, 0.75);

    // Drag to pan, Ctrl+drag to rotate (like other visualizations, no right-click)
    const controls = new OrbitControls(camera, domElement);
    controls.mouseButtons = { LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY };
    controls.minDistance = 0.3; // avoid clipping against camera's near plane
    controls.target.set(0, 0, 0.25);
    controls.update();
    controls.saveState();

    function handleChange() {
      invalidate();
    }
    controls.addEventListener('change', handleChange);
    resetRef.current = () => controls.reset();

    return () => {
      controls.removeEventListener('change', handleChange);
      controls.dispose();
    };
  }, [camera, domElement, invalidate, resetRef]);

  return null;
}

export default SurfaceControls;
