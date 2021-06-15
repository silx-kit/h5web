import type { HTMLAttributes } from 'react';
import { useAxisSystemContext } from './AxisSystemContext';
import Html from './Html';

interface Props extends HTMLAttributes<HTMLDivElement> {
  x: number;
  y: number;
  z?: number;
  scaleOnZoom?: boolean;
}

function Annotation(props: Props) {
  const { x, y, z = 1, scaleOnZoom, children, ...divProps } = props;
  const { abscissaScale, ordinateScale } = useAxisSystemContext();

  return (
    <Html
      groupProps={{
        position: [abscissaScale(x), ordinateScale(y), z],
      }}
      followCamera
      scaleOnZoom={scaleOnZoom}
      {...divProps}
    >
      {children}
    </Html>
  );
}

export default Annotation;
