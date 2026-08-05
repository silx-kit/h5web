import { Canvas } from '@react-three/fiber';
import { type PropsWithChildren, useMemo } from 'react';

import { ScaledOrthographicCamera } from './ScaledOrthographicCamera';

interface Props {
  className?: string;
  orthographic?: boolean;
}

function R3FCanvas(props: PropsWithChildren<Props>) {
  const { className, orthographic, children } = props;

  const camera = useMemo(() => new ScaledOrthographicCamera(), []);

  return (
    <Canvas
      className={className}
      orthographic={orthographic}
      flat // disable tone mapping
      frameloop="demand" // disable game loop
      dpr={[1, 3]} // https://discoverthreejs.com/tips-and-tricks/#performance
      resize={{ debounce: { scroll: 20, resize: 200 }, scroll: false }} // https://github.com/pmndrs/react-three-fiber/discussions/1906
      gl={{ preserveDrawingBuffer: true }} // for "Save Image As..." and snapshot feature to work
      camera={orthographic ? camera : undefined}
    >
      <ambientLight />
      {children}
    </Canvas>
  );
}

export default R3FCanvas;
