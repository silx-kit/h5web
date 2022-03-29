import type { CSSProperties, HTMLAttributes } from 'react';

import { useAxisSystemContext } from './AxisSystemContext';
import Overlay from './Overlay';

interface Props extends HTMLAttributes<HTMLDivElement> {
  x: number;
  y: number;
  z?: number;
  scaleOnZoom?: boolean;
  style?: CSSProperties;
}

function Annotation(props: Props) {
  const { x, y, z = 1, scaleOnZoom, style, children, ...divProps } = props;
  const { abscissaScale, ordinateScale } = useAxisSystemContext();

  return (
    <Overlay
      groupProps={{ position: [abscissaScale(x), ordinateScale(y), z] }}
      followCamera
      scaleOnZoom={scaleOnZoom}
      {...divProps}
    >
      <div style={style}>{children}</div>
    </Overlay>
  );
}

export default Annotation;
