import { useThree } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { Vector2, Vector3 } from 'three';

import { useFrameRendering } from '../hooks';
import { useAxisSystemContext } from './AxisSystemContext';

export interface CameraContextValue {
  worldToHtml: (point: Vector2 | Vector3) => Vector2;
}

const CameraContext = createContext({} as CameraContextValue);

export function useCameraContext() {
  return useContext(CameraContext);
}

function CameraProvider(props: { children: ReactNode }) {
  const { children } = props;

  const camera = useThree((state) => state.camera);
  const { cameraToHtmlMatrix } = useAxisSystemContext();

  useFrameRendering();

  function worldToHtml(point: Vector2 | Vector3) {
    const cameraPoint = new Vector3(point.x, point.y, 0).project(camera);
    const htmlPoint = cameraPoint.clone().applyMatrix4(cameraToHtmlMatrix);
    return new Vector2(htmlPoint.x, htmlPoint.y);
  }

  return (
    <CameraContext.Provider value={{ worldToHtml }}>
      {children}
    </CameraContext.Provider>
  );
}

export default CameraProvider;
