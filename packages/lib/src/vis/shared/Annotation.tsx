import type { HTMLAttributes } from 'react';
import { Vector3 } from 'three';

import { useCameraState } from '../hooks';
import Html from './Html';
import { useVisCanvasContext } from './VisCanvasProvider';

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

  const { dataToHtml } = useVisCanvasContext();
  const { htmlPt, cameraScale } = useCameraState((camera) => ({
    htmlPt: dataToHtml(camera, new Vector3(x, y)),
    cameraScale: camera.scale.clone(),
  }));

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
