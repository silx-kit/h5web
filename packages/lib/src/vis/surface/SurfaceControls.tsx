import { useThree } from '@react-three/fiber';
import { type RefObject, useCallback, useEffect, useRef } from 'react';
import { PerspectiveCamera, Vector3, type Vector3Tuple } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { getFramingDistance } from './utils';

interface Props {
  boxSize: Vector3Tuple;
  resetRef: RefObject<(() => void) | undefined>;
}

// Look at the surface from the front-left, slightly from above (z is up)
const VIEW_DIRECTION = new Vector3(-0.8, -1.4, 1).normalize();
const FOV = 40;
const LABELS_MARGIN = 1.1; // leave some room around the box

function isFiniteVector(vec: Vector3): boolean {
  return (
    Number.isFinite(vec.x) && Number.isFinite(vec.y) && Number.isFinite(vec.z)
  );
}

function getBoxRadius(w: number, h: number, zHeight: number): number {
  return (LABELS_MARGIN * Math.hypot(w, h, zHeight)) / 2;
}

function SurfaceControls(props: Props) {
  const { boxSize, resetRef } = props;
  const [w, h, zHeight] = boxSize;

  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);
  const aspect = useThree((state) => state.size.width / state.size.height);

  const controlsRef = useRef<OrbitControls>(undefined);

  useEffect(() => {
    camera.up.set(0, 0, 1);
    const controls = new OrbitControls(camera, domElement);
    controls.zoomSpeed = 1.5;
    controlsRef.current = controls;

    function handleChange() {
      invalidate();
    }
    controls.addEventListener('change', handleChange);

    return () => {
      controls.removeEventListener('change', handleChange);
      controls.dispose();
      controlsRef.current = undefined;
    };
  }, [camera, domElement, invalidate]);

  const needsFramingRef = useRef(true);
  const prevHeightRef = useRef(zHeight);

  // Look at whole surface from default angle
  const frame = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls || !(camera instanceof PerspectiveCamera)) {
      return;
    }

    const radius = getBoxRadius(w, h, zHeight);
    const distance = getFramingDistance(radius, FOV, aspect);
    if (distance === undefined || !Number.isFinite(distance)) {
      needsFramingRef.current = true; // try again once canvas has a size
      return;
    }

    const target = new Vector3(0, 0, zHeight / 2);

    camera.fov = FOV;
    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.position.copy(target).addScaledVector(VIEW_DIRECTION, distance);
    camera.updateProjectionMatrix();

    controls.target.copy(target);
    controls.minDistance = radius * 0.1;
    controls.maxDistance = distance * 10;
    controls.update();

    needsFramingRef.current = false;
    prevHeightRef.current = zHeight;
    invalidate();
  }, [camera, w, h, zHeight, aspect, invalidate]);

  const frameRef = useRef(frame);
  frameRef.current = frame;

  // Frame on load and when footprint changes (i.e. new data or axes)
  useEffect(() => {
    needsFramingRef.current = true;
    frameRef.current();
  }, [w, h]);

  // Frame once canvas gets a valid size, if framing was skipped; otherwise, keep user's view on resize
  useEffect(() => {
    if (needsFramingRef.current) {
      frameRef.current();
    }
  }, [aspect]);

  // When height scale changes, keep user's view angle, zoom and pan, relative to the box
  useEffect(() => {
    const controls = controlsRef.current;
    const prevHeight = prevHeightRef.current;
    if (!controls || needsFramingRef.current || prevHeight === zHeight) {
      return;
    }

    const zRatio = zHeight / prevHeight;
    const sizeRatio =
      getBoxRadius(w, h, zHeight) / getBoxRadius(w, h, prevHeight);

    const offset = camera.position.clone().sub(controls.target);
    const target = controls.target.clone();
    target.z *= zRatio;
    offset.multiplyScalar(sizeRatio);
    const position = target.clone().add(offset);

    if (!isFiniteVector(target) || !isFiniteVector(position)) {
      return;
    }

    controls.target.copy(target);
    camera.position.copy(position);
    if (camera instanceof PerspectiveCamera) {
      camera.near *= sizeRatio;
      camera.far *= sizeRatio;
      camera.updateProjectionMatrix();
    }
    controls.minDistance *= sizeRatio;
    controls.maxDistance *= sizeRatio;
    controls.update();

    prevHeightRef.current = zHeight;
    invalidate();
  }, [camera, w, h, zHeight, invalidate]);

  useEffect(() => {
    resetRef.current = frame;
  }, [resetRef, frame]);

  return null;
}

export default SurfaceControls;
