import { assertDefined, assertNonNull } from '@h5web/shared/guards';
import { type VisibleDomains } from '@h5web/shared/vis-models';
import { useThree } from '@react-three/fiber';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { type Camera, Matrix4, Vector3 } from 'three';

import Box from '../../interactions/box';
import { type AxisConfig, type AxisScale, type Size } from '../models';
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
  svgOverlay: SVGSVGElement | null;
  floatingToolbar: HTMLDivElement | null;
}

function VisCanvasProvider(props: PropsWithChildren<Props>) {
  const {
    visRatio,
    abscissaConfig,
    ordinateConfig,
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

  const gl = useThree((state) => state.gl);
  const canvasWrapper = gl.domElement.parentElement;
  assertNonNull(canvasWrapper);
  const r3fRoot = canvasWrapper.parentElement;
  assertNonNull(r3fRoot);
  const canvasArea = r3fRoot.parentElement;
  assertNonNull(canvasArea);
  const visCanvas = canvasArea.parentElement;
  assertNonNull(visCanvas);

  return (
    <VisCanvasContext
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
        svgOverlay,
        floatingToolbar,
      }}
    >
      {children}
    </VisCanvasContext>
  );
}

export default VisCanvasProvider;
