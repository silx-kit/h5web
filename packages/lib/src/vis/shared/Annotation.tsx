import { useThree } from '@react-three/fiber';
import type { HTMLAttributes } from 'react';
import { Vector2 } from 'three';

import { useWorldToHtml } from '../hooks';
import { useAxisSystemContext } from './AxisSystemContext';
import Html from './Html';

interface Props extends HTMLAttributes<HTMLDivElement> {
  x: number;
  y: number;
  scaleOnZoom?: boolean;
}

function Annotation(props: Props) {
  const { x, y, scaleOnZoom, children, style, ...divProps } = props;

  const camera = useThree((state) => state.camera);

  const { dataToWorld } = useAxisSystemContext();
  const worldToHtml = useWorldToHtml();

  const htmlPt = worldToHtml(dataToWorld(new Vector2(x, y)));

  return (
    <Html>
      <div
        style={{
          position: 'absolute',
          top: htmlPt.y,
          left: htmlPt.x,
          pointerEvents: 'none',
          transform: scaleOnZoom
            ? `scale(${1 / camera.scale.x}, ${1 / camera.scale.y})`
            : '',
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
