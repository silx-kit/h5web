import { type Size, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import {
  type Camera,
  CanvasTexture,
  LinearFilter,
  PerspectiveCamera,
  type Sprite,
  SRGBColorSpace,
  Vector3,
  type Vector3Tuple,
} from 'three';

interface Props {
  text: string;
  position: Vector3Tuple;
  outward?: Vector3Tuple; // anchor text so it extends in this direction on screen
  color: string;
  fontSize: number; // in CSS pixels
  fontWeight?: number | string;
  fontFamily: string;
  priority?: number; // when labels overlap on screen, only the one with highest priority is shown
}

const PADDING = 2; // CSS pixels around text, to avoid clipping antialiased edges

export interface LabelUserData {
  isLabel: true;
  width: number; // CSS pixels
  height: number;
  priority: number;
  outward?: Vector3Tuple;
}

const start = new Vector3();
const end = new Vector3();
const offset = new Vector3();

/**
 * Keep label at constant size on screen and anchor it on the side closest to the box,
 * so it extends outwards whatever the view angle. Must run before every render,
 * since camera and viewport size may change (done in `SurfaceAxes`).
 */
export function updateLabelSprite(
  sprite: Sprite,
  camera: Camera,
  size: Size,
): void {
  const { width, height, outward } = sprite.userData as LabelUserData;

  // With `sizeAttenuation: false`, sprite scale is expressed at a distance of 1 from the camera
  const fov = camera instanceof PerspectiveCamera ? camera.fov : 45;
  const unitsPerPixel =
    (2 * Math.tan((fov * Math.PI) / 360)) / Math.max(size.height, 1);
  sprite.scale.set(width * unitsPerPixel, height * unitsPerPixel, 1);

  if (!outward) {
    return;
  }

  start.copy(sprite.position).project(camera);
  end
    .copy(sprite.position)
    .add(offset.set(...outward).multiplyScalar(0.1))
    .project(camera);

  const dx = (end.x - start.x) * size.width;
  const dy = (end.y - start.y) * size.height;
  const length = Math.hypot(dx, dy);

  if (length > 0 && Number.isFinite(length)) {
    sprite.center.set(0.5 - (0.5 * dx) / length, 0.5 - (0.5 * dy) / length);
  }
}

/**
 * Text that always faces the camera (billboard) and keeps a constant size on screen.
 * Rendered to a canvas texture to avoid depending on a font-loading library.
 */
function TextSprite(props: Props) {
  const {
    text,
    position,
    outward,
    color,
    fontSize,
    fontWeight = 400,
    fontFamily,
    priority = 0,
  } = props;

  const dpr = useThree((state) => state.viewport.dpr);

  const { texture, width, height } = useMemo(() => {
    const font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.font = font;
    }

    const textWidth = ctx?.measureText(text).width ?? text.length * fontSize;
    const cssWidth = Math.ceil(textWidth) + PADDING * 2;
    const cssHeight = Math.ceil(fontSize * 1.3) + PADDING * 2;

    canvas.width = Math.max(cssWidth * dpr, 1);
    canvas.height = Math.max(cssHeight * dpr, 1);

    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.font = font; // resizing the canvas resets the context
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, cssWidth / 2, cssHeight / 2);
    }

    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    tex.minFilter = LinearFilter;
    tex.generateMipmaps = false;

    return { texture: tex, width: cssWidth, height: cssHeight };
  }, [text, color, fontSize, fontWeight, fontFamily, dpr]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <sprite
      position={position}
      renderOrder={10}
      userData={{ isLabel: true, width, height, priority, outward }}
    >
      <spriteMaterial
        map={texture}
        transparent
        depthTest={false}
        depthWrite={false}
        sizeAttenuation={false}
      />
    </sprite>
  );
}

export default TextSprite;
