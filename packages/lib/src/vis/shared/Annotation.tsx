import type { HTMLAttributes } from 'react';
import { Vector2 } from 'three';

import { useCameraState } from '../hooks';
import { dataToHtml } from '../utils';
import Html from './Html';

interface Props extends HTMLAttributes<HTMLDivElement> {
  x: number;
  y: number;
  overflowCanvas?: boolean;
  scaleOnZoom?: boolean;
  center?: boolean;
}

function Annotation(props: Props) {
  const {
    x,
    y,
    overflowCanvas,
    scaleOnZoom,
    center,
    children,
    style,
    ...divProps
  } = props;

  if ((center || scaleOnZoom) && style?.transform) {
    throw new Error(
      'Annotation with `center` and/or `scaleOnZoom` cannot have its own `transform`'
    );
  }

  const { htmlPt, cameraScale } = useCameraState(
    (camera, context) => ({
      htmlPt: dataToHtml(camera, context, new Vector2(x, y)),
      cameraScale: camera.scale.clone(),
    }),
    [x, y]
  );

  const transforms = [
    center ? 'translate(-50%, -50%)' : '',
    scaleOnZoom ? `scale(${1 / cameraScale.x}, ${1 / cameraScale.y})` : '',
  ];

  return (
    <Html overflowCanvas={overflowCanvas}>
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
