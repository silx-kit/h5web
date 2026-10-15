import { type Domain, ScaleType } from '@h5web/shared/vis-models';
import { formatTick } from '@h5web/shared/vis-utils';
import { type Size, useFrame, useThree } from '@react-three/fiber';
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  type Camera,
  type Group,
  type Sprite,
  Vector3,
  type Vector3Tuple,
} from 'three';

import { type VisScaleType } from '../models';
import { createScale, getTickFormatter } from '../utils';
import TextSprite, {
  type LabelUserData,
  updateLabelSprite,
} from './TextSprite';
import { getAxisTicks } from './utils';

interface AxisConfig {
  domain: Domain;
  isIndexAxis: boolean;
  label?: string;
  flip?: boolean;
}

interface Props {
  footprint: [number, number];
  zHeight: number;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  valueDomain: Domain;
  valueLabel?: string;
  scaleType: VisScaleType;
  showGrid: boolean;
}

interface Theme {
  tickLabels: string;
  axisLabels: string;
  ticks: string;
  grid: string;
  gridOpacity: number;
  tickFontFamily: string;
  axisFontFamily: string;
  axisFontWeight: string;
}

const TICK_LENGTH = 0.025;
const TICK_LABEL_OFFSET = 0.04; // labels are anchored so they extend away from the box
const AXIS_LABEL_OFFSET = 0.16;
const Z_LABEL_OFFSET = 0.05; // along both X and Y, i.e. diagonally away from the corner
const TICK_FONT_SIZE = 11;
const LABEL_FONT_SIZE = 13;
const MIN_Z_EXTENT = 0.05;

function readTheme(elem: HTMLElement): Theme {
  const style = getComputedStyle(elem);
  function get(name: string, fallback: string, isColor = false): string {
    const value = style.getPropertyValue(name).trim();
    return value && (!isColor || CSS.supports('color', value))
      ? value
      : fallback;
  }

  const gridOpacity = Number.parseFloat(get('--h5w-grid--opacity', ''));
  const fontFamily = style.fontFamily || 'sans-serif';

  return {
    tickLabels: get('--h5w-tickLabels--color', '#333', true),
    axisLabels: get('--h5w-axisLabels--color', '#333', true),
    ticks: get('--h5w-ticks--color', 'gray', true),
    grid: get('--h5w-grid--color', 'gray', true),
    gridOpacity: Number.isFinite(gridOpacity) ? gridOpacity : 0.33,
    tickFontFamily: get('--h5w-tickLabels--fontFamily', fontFamily),
    axisFontFamily: get('--h5w-axisLabels--fontFamily', fontFamily),
    axisFontWeight: get('--h5w-axisLabels--fontWeight', '600'),
  };
}

function useLineGeometry(points: number[]): BufferGeometry {
  const geometry = useMemo(() => {
    const geom = new BufferGeometry();
    geom.setAttribute(
      'position',
      new BufferAttribute(Float32Array.from(points), 3),
    );
    return geom;
  }, [points]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

/** Which side of the box the camera is on, along X and Y (`1` or `-1`). */
function useCameraSides(): [number, number] {
  const [sides, setSides] = useState<[number, number]>([-1, -1]);
  const sidesRef = useRef(sides);

  useFrame(({ camera }) => {
    const sx = camera.position.x >= 0 ? 1 : -1;
    const sy = camera.position.y >= 0 ? 1 : -1;
    if (sx !== sidesRef.current[0] || sy !== sidesRef.current[1]) {
      sidesRef.current = [sx, sy];
      setSides([sx, sy]);
    }
  });

  return sides;
}

interface Rect {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

const LABEL_PADDING = 2; // px

const ndc = new Vector3();

/** Rectangle of label on screen, or `undefined` if label is behind camera or off-screen. */
function getScreenRect(
  sprite: Sprite,
  camera: Camera,
  size: Size,
): Rect | undefined {
  const { width, height } = sprite.userData as LabelUserData;
  sprite.getWorldPosition(ndc).project(camera);
  const x = ((ndc.x + 1) / 2) * size.width - sprite.center.x * width;
  const y = ((ndc.y + 1) / 2) * size.height - sprite.center.y * height;

  const isOnScreen =
    Math.abs(ndc.z) <= 1 &&
    x + width >= 0 &&
    x <= size.width &&
    y + height >= 0 &&
    y <= size.height;

  return isOnScreen
    ? { left: x, right: x + width, bottom: y, top: y + height }
    : undefined;
}

function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.left < b.right + LABEL_PADDING &&
    b.left < a.right + LABEL_PADDING &&
    a.bottom < b.top + LABEL_PADDING &&
    b.bottom < a.top + LABEL_PADDING
  );
}

/**
 * Keep labels at constant size on screen and anchored away from the box, and
 * hide labels that overlap labels of higher priority on screen (e.g. value-axis labels
 * colliding with y-axis labels near the corner they share at low view angles).
 */
function useLabelCollisions(groupRef: RefObject<Group>): void {
  useFrame(({ camera, size }) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    const sprites = group.children
      .filter((child): child is Sprite => !!child.userData.isLabel)
      .sort(
        (a, b) =>
          (b.userData.priority as number) - (a.userData.priority as number),
      );

    const shown: Rect[] = [];
    for (const sprite of sprites) {
      updateLabelSprite(sprite, camera, size);
      const rect = getScreenRect(sprite, camera, size);
      sprite.visible = !rect || !shown.some((other) => overlaps(rect, other));
      if (rect && sprite.visible) {
        shown.push(rect);
      }
    }
  });
}

interface Label {
  key: string;
  text: string;
  position: Vector3Tuple;
  outward: Vector3Tuple; // direction away from the box, to anchor the label
  priority: number;
  isAxisLabel?: boolean;
}

const PRIORITY = { axisLabel: 3, tick: 2, valueTick: 1 };

function SurfaceAxes(props: Props) {
  const {
    footprint,
    zHeight,
    abscissaConfig,
    ordinateConfig,
    valueDomain,
    valueLabel,
    scaleType,
    showGrid,
  } = props;

  const [w, h] = footprint;
  const domElement = useThree((state) => state.gl.domElement);
  const theme = useMemo(() => readTheme(domElement), [domElement]);

  const [sx, sy] = useCameraSides();

  const groupRef = useRef<Group>(null);
  useLabelCollisions(groupRef);

  const { axisPoints, gridPoints, labels } = useMemo(() => {
    const xScale = createScale(ScaleType.Linear, {
      domain: abscissaConfig.domain,
      range: abscissaConfig.flip ? [w / 2, -w / 2] : [-w / 2, w / 2],
    });
    const yScale = createScale(ScaleType.Linear, {
      domain: ordinateConfig.domain,
      range: ordinateConfig.flip ? [h / 2, -h / 2] : [-h / 2, h / 2],
    });
    const zScale = createScale(scaleType, {
      domain: valueDomain,
      range: [0, zHeight],
    });

    const xTicks = getAxisTicks(
      abscissaConfig.domain,
      Math.max(Math.round(w * 6), 2),
      abscissaConfig.isIndexAxis,
    );
    const yTicks = getAxisTicks(
      ordinateConfig.domain,
      Math.max(Math.round(h * 6), 2),
      ordinateConfig.isIndexAxis,
    );

    const zFormatter = getTickFormatter(
      valueDomain,
      300,
      Array.isArray(scaleType) ? scaleType[0] : scaleType,
    );
    const showZ = zHeight >= MIN_Z_EXTENT; // z ticks would collapse on a flat surface
    const zTicks = showZ
      ? zScale
          .ticks(Math.max(Math.round(zHeight * 8), 2))
          .filter((val) => zFormatter(val) !== '')
      : [];

    const xNear = (sx * w) / 2;
    const xFar = -xNear;
    const yNear = (sy * h) / 2;
    const yFar = -yNear;

    const axis: number[] = [];
    const grid: number[] = [];
    const texts: Label[] = [];

    function seg(arr: number[], a: Vector3Tuple, b: Vector3Tuple): void {
      arr.push(...a, ...b);
    }

    // Floor outline
    seg(axis, [-w / 2, -h / 2, 0], [w / 2, -h / 2, 0]);
    seg(axis, [w / 2, -h / 2, 0], [w / 2, h / 2, 0]);
    seg(axis, [w / 2, h / 2, 0], [-w / 2, h / 2, 0]);
    seg(axis, [-w / 2, h / 2, 0], [-w / 2, -h / 2, 0]);

    // Back walls' vertical edges and z axis
    seg(axis, [xNear, yFar, 0], [xNear, yFar, zHeight]);
    seg(grid, [xFar, yFar, 0], [xFar, yFar, zHeight]);
    seg(grid, [xFar, yNear, 0], [xFar, yNear, zHeight]);

    xTicks.forEach((val) => {
      const x = xScale(val);
      seg(axis, [x, yNear, 0], [x, yNear + sy * TICK_LENGTH, 0]);
      if (showGrid) {
        seg(grid, [x, yNear, 0], [x, yFar, 0]);
        seg(grid, [x, yFar, 0], [x, yFar, zHeight]);
      }
      texts.push({
        key: `x${val}`,
        text: formatTick(val),
        position: [x, yNear + sy * TICK_LABEL_OFFSET, 0],
        outward: [0, sy, 0],
        priority: PRIORITY.tick,
      });
    });

    yTicks.forEach((val) => {
      const y = yScale(val);
      seg(axis, [xNear, y, 0], [xNear + sx * TICK_LENGTH, y, 0]);
      if (showGrid) {
        seg(grid, [xNear, y, 0], [xFar, y, 0]);
        seg(grid, [xFar, y, 0], [xFar, y, zHeight]);
      }
      texts.push({
        key: `y${val}`,
        text: formatTick(val),
        position: [xNear + sx * TICK_LABEL_OFFSET, y, 0],
        outward: [sx, 0, 0],
        priority: PRIORITY.tick,
      });
    });

    zTicks.forEach((val) => {
      const z = zScale(val);
      seg(axis, [xNear, yFar, z], [xNear, yFar - sy * TICK_LENGTH, z]);
      if (showGrid) {
        seg(grid, [xNear, yFar, z], [xFar, yFar, z]);
        seg(grid, [xFar, yFar, z], [xFar, yNear, z]);
      }
      texts.push({
        key: `z${val}`,
        text: formatTick(val),
        position: [xNear + sx * Z_LABEL_OFFSET, yFar - sy * Z_LABEL_OFFSET, z],
        outward: [sx, -sy, 0], // diagonally away from the corner, and from the surface
        priority: PRIORITY.valueTick,
      });
    });

    texts.push(
      {
        key: 'x-label',
        text: abscissaConfig.label ?? '',
        position: [0, yNear + sy * AXIS_LABEL_OFFSET, 0],
        outward: [0, sy, 0],
        priority: PRIORITY.axisLabel,
        isAxisLabel: true,
      },
      {
        key: 'y-label',
        text: ordinateConfig.label ?? '',
        position: [xNear + sx * AXIS_LABEL_OFFSET, 0, 0],
        outward: [sx, 0, 0],
        priority: PRIORITY.axisLabel,
        isAxisLabel: true,
      },
    );

    if (valueLabel && showZ) {
      texts.push({
        key: 'z-label',
        text: valueLabel,
        position: [xNear, yFar, zHeight + TICK_LABEL_OFFSET],
        outward: [0, 0, 1],
        priority: PRIORITY.axisLabel,
        isAxisLabel: true,
      });
    }

    return {
      axisPoints: axis,
      gridPoints: grid,
      labels: texts.filter(({ text }) => text), // no placeholder for missing labels
    };
  }, [
    w,
    h,
    zHeight,
    sx,
    sy,
    abscissaConfig,
    ordinateConfig,
    valueDomain,
    valueLabel,
    scaleType,
    showGrid,
  ]);

  const axisGeometry = useLineGeometry(axisPoints);
  const gridGeometry = useLineGeometry(gridPoints);

  return (
    <group ref={groupRef}>
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial
          color={theme.grid}
          transparent
          opacity={theme.gridOpacity}
          depthWrite={false}
        />
      </lineSegments>
      <lineSegments geometry={axisGeometry}>
        <lineBasicMaterial color={theme.ticks} />
      </lineSegments>
      {labels.map(({ key, text, position, outward, priority, isAxisLabel }) => (
        <TextSprite
          key={key}
          priority={priority}
          text={text}
          position={position}
          outward={outward}
          color={isAxisLabel ? theme.axisLabels : theme.tickLabels}
          fontSize={isAxisLabel ? LABEL_FONT_SIZE : TICK_FONT_SIZE}
          fontWeight={isAxisLabel ? theme.axisFontWeight : 400}
          fontFamily={isAxisLabel ? theme.axisFontFamily : theme.tickFontFamily}
        />
      ))}
    </group>
  );
}

export type { AxisConfig as SurfaceAxisConfig };
export default SurfaceAxes;
