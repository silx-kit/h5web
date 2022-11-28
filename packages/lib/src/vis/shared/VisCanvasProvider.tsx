import { useThree } from '@react-three/fiber';
import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { Matrix4, Vector2, Vector3 } from 'three';

import type { AxisConfig, AxisScale, Size } from '../models';
import { getCanvasScale, getSizeToFit } from '../utils';

export interface VisCanvasContextValue {
  canvasSize: Size;
  canvasRatio: number;
  visRatio: number | undefined;
  visSize: Size;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  abscissaScale: AxisScale;
  ordinateScale: AxisScale;
  dataToWorld: (dataPt: Vector2) => Vector3;
  worldToData: (worldPt: Vector3) => Vector2;

  // For internal use only
  cameraToHtml: (cameraPt: Vector3) => Vector2;
  htmlToCamera: (htmlPt: Vector2) => Vector3;
  floatingToolbar: HTMLDivElement | undefined;
}

const VisCanvasContext = createContext({} as VisCanvasContextValue);

export function useVisCanvasContext() {
  return useContext(VisCanvasContext);
}

interface Props {
  visRatio: number | undefined;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  floatingToolbar: HTMLDivElement | undefined;
}

function VisCanvasProvider(props: PropsWithChildren<Props>) {
  const {
    visRatio,
    abscissaConfig,
    ordinateConfig,
    floatingToolbar,
    children,
  } = props;

  const canvasSize = useThree((state) => state.size);
  const visSize = getSizeToFit(canvasSize, visRatio);

  const { width, height } = canvasSize;
  const canvasRatio = width / height;

  const abscissaScale = getCanvasScale(abscissaConfig, visSize.width);
  const ordinateScale = getCanvasScale(ordinateConfig, visSize.height);

  const dataToWorld = useCallback(
    (dataPt: Vector2) =>
      new Vector3(abscissaScale(dataPt.x), ordinateScale(dataPt.y), 0),
    [abscissaScale, ordinateScale]
  );

  const worldToData = useCallback(
    (worldPt: Vector3) =>
      new Vector2(
        abscissaScale.invert(worldPt.x),
        ordinateScale.invert(worldPt.y)
      ),
    [abscissaScale, ordinateScale]
  );

  const cameraToHtmlMatrix = useMemo(() => {
    return new Matrix4()
      .makeScale(width / 2, -height / 2, 1) // scale from normalized camera space to HTML space
      .setPosition(width / 2, height / 2, 0); // account for shift of (0,0) position (center for camera, top-left for HTML)
  }, [width, height]);

  const cameraToHtmlMatrixInverse = useMemo(() => {
    return cameraToHtmlMatrix.clone().invert();
  }, [cameraToHtmlMatrix]);

  const cameraToHtml = useCallback(
    (cameraPt: Vector3) => {
      const htmlPoint = cameraPt.clone().applyMatrix4(cameraToHtmlMatrix);
      return new Vector2(htmlPoint.x, htmlPoint.y);
    },
    [cameraToHtmlMatrix]
  );

  const htmlToCamera = useCallback(
    (htmlPt: Vector2) => {
      return new Vector3(htmlPt.x, htmlPt.y, 0).applyMatrix4(
        cameraToHtmlMatrixInverse
      );
    },
    [cameraToHtmlMatrixInverse]
  );

  return (
    <VisCanvasContext.Provider
      value={{
        canvasSize,
        canvasRatio,
        visRatio,
        visSize,
        abscissaConfig,
        ordinateConfig,
        abscissaScale,
        ordinateScale,
        dataToWorld,
        worldToData,
        cameraToHtml,
        htmlToCamera,
        floatingToolbar,
      }}
    >
      {children}
    </VisCanvasContext.Provider>
  );
}

export default VisCanvasProvider;
