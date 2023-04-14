import { type CSSProperties, type ReactNode } from 'react';

import Html from './Html';
import { useVisCanvasContext } from './VisCanvasProvider';

interface Props {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function Overlay(props: Props) {
  const { children, style, className } = props;
  const { canvasSize } = useVisCanvasContext();

  return (
    <Html>
      <div
        className={className}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          ...canvasSize,
          ...style,
        }}
      >
        {children}
      </div>
    </Html>
  );
}

export default Overlay;
