import type { ReactNode, CSSProperties } from 'react';

import { useAxisSystemContext } from './AxisSystemProvider';
import Html from './Html';

interface Props {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function Overlay(props: Props) {
  const { children, style, className } = props;
  const { canvasSize } = useAxisSystemContext();

  return (
    <Html>
      <div
        className={className}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
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
