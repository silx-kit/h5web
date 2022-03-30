import { useThree } from '@react-three/fiber';
import type { ReactNode, CSSProperties } from 'react';

import Html from './Html';

interface Props {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function Overlay(props: Props) {
  const { children, style, className } = props;

  const { width, height } = useThree((state) => state.size);

  return (
    <Html>
      <div
        className={className}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          width,
          height,
          ...style,
        }}
      >
        {children}
      </div>
    </Html>
  );
}

export default Overlay;
