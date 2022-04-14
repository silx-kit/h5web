import { useThree } from '@react-three/fiber';
import type { HTMLAttributes } from 'react';
import { Vector2 } from 'three';

import { useFrameRendering } from '../hooks';
import { useAxisSystemContext } from './AxisSystemProvider';
import Html from './Html';

interface Props extends HTMLAttributes<HTMLDivElement> {
  x: number;
  y: number;
  scaleOnZoom?: boolean;
}

function Annotation(props: Props) {
  const { x, y, scaleOnZoom, children, style, ...divProps } = props;

  const camera = useThree((state) => state.camera);
  useFrameRendering();

  const { dataToWorld, worldToHtml } = useAxisSystemContext();
  const htmlPt = worldToHtml(dataToWorld(new Vector2(x, y)));

  if (scaleOnZoom && style?.transform) {
    throw new Error(
      'Annotation with `scaleOnZoom` cannot have its own `transform`'
    );
  }

  return (
    <Html>
      <div
        style={{
          position: 'absolute',
          top: htmlPt.y,
          left: htmlPt.x,
          pointerEvents: 'none',
          transform: scaleOnZoom
            ? `translate(-50%, -50%) scale(${1 / camera.scale.x}, ${
                1 / camera.scale.y
              })`
            : undefined,
          ...style,
        }}
        {...divProps}
      >
        {children}
      </div>
    </Html>
  );
}

export default Annotation;
