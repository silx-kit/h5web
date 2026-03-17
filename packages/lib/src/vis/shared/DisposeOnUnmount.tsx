import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

// Avoids "THREE.WebGLRenderer: Context Lost." in console when canvas is not disposed of properly on unmount
function DisposeOnUnmount() {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    return () => {
      gl.dispose();
    };
  }, [gl]);

  return null;
}

export default DisposeOnUnmount;
