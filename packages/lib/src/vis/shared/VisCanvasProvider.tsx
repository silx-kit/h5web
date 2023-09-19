import type { VisibleDomains } from '@h5web/shared';
import { assertDefined, assertNonNull } from '@h5web/shared';
import { useThree } from '@react-three/fiber';
import type { PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import type { Camera } from 'three';
import { Matrix4, Vector3 } from 'three';

import Box from '../../interactions/box';
import type { AxisConfig, AxisScale, Size } from '../models';
import { getCanvasAxisScale, getSizeToFit } from '../utils';

export interface VisCanvasContextValue {
  canvasSize: Size;
  canvasRatio: number;
  canvasBox: Box;
  visRatio: number | undefined;
  visSize: Size;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  abscissaScale: AxisScale;
  ordinateScale: AxisScale;
  dataToWorld: (dataPt: Vector3) => Vector3;
  dataToHtml: (camera: Camera, dataPt: Vector3) => Vector3;
  worldToHtml: (camera: Camera, worldPt: Vector3) => Vector3;
  worldToData: (worldPt: Vector3) => Vector3;
  htmlToWorld: (camera: Camera, htmlPt: Vector3) => Vector3;
  htmlToData: (camera: Camera, htmlPt: Vector3) => Vector3;
  getFovBox: (camera: Camera, center?: Vector3) => Box;
  getVisibleDomains: (camera: Camera) => VisibleDomains;

  // DOM elements for use as portal targets
  visCanvas: HTMLElement;
  canvasArea: HTMLElement;
  r3fRoot: HTMLElement;
  htmlOverlay: HTMLDivElement | null;
  svgOverlay: SVGSVGElement | null;
  floatingToolbar: HTMLDivElement | null;
}

const VisCanvasContext = createContext({} as VisCanvasContextValue);

export function useVisCanvasContext() {
  return useContext(VisCanvasContext);
}

interface Props {
  visRatio: number | undefined;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  htmlOverlay: HTMLDivElement | null;
  svgOverlay: SVGSVGElement | null;
  floatingToolbar: HTMLDivElement | null;
}

function VisCanvasProvider(props: PropsWithChildren<Props>) {
  const {
    visRatio,
    abscissaConfig,
    ordinateConfig,
    htmlOverlay,
    svgOverlay,
    floatingToolbar,
    children,
  } = props;

  const { width, height } = useThree((state) => state.size);
  const canvasSize = { width, height };
  const canvasRatio = width / height;

  const visSize = getSizeToFit(canvasSize, visRatio);

  const canvasBox = useMemo(
    () => Box.empty().expandByPoint(new Vector3(width, height)),
    [width, height],
  );

  const abscissaScale = getCanvasAxisScale(abscissaConfig, visSize.width);
  const ordinateScale = getCanvasAxisScale(ordinateConfig, visSize.height);

  const dataToWorld = useCallback(
    (dataPt: Vector3) => {
      return new Vector3(abscissaScale(dataPt.x), ordinateScale(dataPt.y));
    },
    [abscissaScale, ordinateScale],
  );

  const worldToData = useCallback(
    (worldPt: Vector3) => {
      return new Vector3(
        abscissaScale.invert(worldPt.x),
        ordinateScale.invert(worldPt.y),
      );
    },
    [abscissaScale, ordinateScale],
  );

  const cameraToHtmlMatrix = useMemo(() => {
    return new Matrix4()
      .makeScale(width / 2, -height / 2, 1) // scale from normalized camera space to HTML space
      .setPosition(width / 2, height / 2, 0); // account for shift of (0,0) position (center for camera, top-left for HTML)
  }, [width, height]);

  const cameraToHtmlMatrixInverse = useMemo(() => {
    return cameraToHtmlMatrix.clone().invert();
  }, [cameraToHtmlMatrix]);

  const worldToHtml = useCallback(
    (camera: Camera, worldPt: Vector3): Vector3 => {
      return worldPt.clone().project(camera).applyMatrix4(cameraToHtmlMatrix);
    },
    [cameraToHtmlMatrix],
  );

  const htmlToWorld = useCallback(
    (camera: Camera, htmlPt: Vector3): Vector3 => {
      return htmlPt
        .clone()
        .applyMatrix4(cameraToHtmlMatrixInverse)
        .unproject(camera);
    },
    [cameraToHtmlMatrixInverse],
  );

  const dataToHtml = useCallback(
    (camera: Camera, dataPt: Vector3): Vector3 => {
      return worldToHtml(camera, dataToWorld(dataPt));
    },
    [dataToWorld, worldToHtml],
  );

  const htmlToData = useCallback(
    (camera: Camera, htmlPt: Vector3): Vector3 => {
      return worldToData(htmlToWorld(camera, htmlPt));
    },
    [htmlToWorld, worldToData],
  );

  const getFovBox = useCallback(
    (camera: Camera, center: Vector3 = camera.position): Box => {
      const { scale } = camera;
      return Box.empty(center).expandBySize(width * scale.x, height * scale.y);
    },
    [width, height],
  );

  const getVisibleDomains = useCallback(
    (camera: Camera): VisibleDomains => {
      const [dataMin, dataMax] = getFovBox(camera).toRect().map(worldToData);

      return {
        xVisibleDomain: [dataMin.x, dataMax.x],
        yVisibleDomain: [dataMin.y, dataMax.y],
      };
    },
    [getFovBox, worldToData],
  );

  const r3fRoot = useThree(
    (state) => state.gl.domElement.parentElement?.parentElement,
  );
  assertDefined(r3fRoot);
  assertNonNull(r3fRoot);
  const canvasArea = r3fRoot.parentElement;
  assertNonNull(canvasArea);
  const visCanvas = canvasArea.parentElement;
  assertNonNull(visCanvas);

  const connect = useThree((state) => state.events.connect);
  assertDefined(connect);
  useEffect(() => {
    connect(canvasArea);
  }, [canvasArea, connect]);

  return (
    <VisCanvasContext.Provider
      value={{
        canvasSize,
        canvasRatio,
        canvasBox,
        visRatio,
        visSize,
        abscissaConfig,
        ordinateConfig,
        abscissaScale,
        ordinateScale,
        dataToWorld,
        dataToHtml,
        worldToHtml,
        worldToData,
        htmlToWorld,
        htmlToData,
        getFovBox,
        getVisibleDomains,
        visCanvas,
        canvasArea,
        r3fRoot,
        htmlOverlay,
        svgOverlay,
        floatingToolbar,
      }}
    >
      {children}
    </VisCanvasContext.Provider>
  );
}

export default VisCanvasProvider;
