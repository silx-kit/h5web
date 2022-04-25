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
  center?: boolean;
}

function Annotation(props: Props) {
  const { x, y, scaleOnZoom, center, children, style, ...divProps } = props;

  const camera = useThree((state) => state.camera);
  useFrameRendering();

  const { dataToWorld, worldToHtml } = useAxisSystemContext();
  const htmlPt = worldToHtml(dataToWorld(new Vector2(x, y)));

  if ((center || scaleOnZoom) && style?.transform) {
    throw new Error(
      'Annotation with `center` and/or `scaleOnZoom` cannot have its own `transform`'
    );
  }

  const transforms = [
    center ? 'translate(-50%, -50%)' : '',
    scaleOnZoom ? `scale(${1 / camera.scale.x}, ${1 / camera.scale.y})` : '',
  ];

  return (
    <Html>
      <div
        style={{
          position: 'absolute',
          top: htmlPt.y,
          left: htmlPt.x,
          pointerEvents: 'none',
          transformOrigin: scaleOnZoom && !center ? 'top left' : undefined,
          transform: transforms.join(' ').trim(),
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
