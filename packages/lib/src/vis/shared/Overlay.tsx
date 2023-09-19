import type { CSSProperties, PropsWithChildren } from 'react';

import Html from './Html';
import { useVisCanvasContext } from './VisCanvasProvider';

interface Props {
  className?: string;
  style?: CSSProperties;
}

function Overlay(props: PropsWithChildren<Props>) {
  const { children, style, className } = props;
  const { canvasSize } = useVisCanvasContext();

  return (
    <Html overflowCanvas>
      <div
        className={className}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 'var(--h5w-zi-customOverlay)', // override to move in front of or behind other layers
          pointerEvents: 'none', // restore interaction on specific elements with `pointer-events: auto`
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
