import type { CanvasProps } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';

function R3FCanvas(props: CanvasProps) {
  const { children, ...canvasProps } = props;

  return (
    <Canvas
      flat // disable tone mapping
      frameloop="demand" // disable game loop
      dpr={[1, 3]} // https://discoverthreejs.com/tips-and-tricks/#performance
      resize={{ debounce: { scroll: 20, resize: 200 }, scroll: false }} // https://github.com/pmndrs/react-three-fiber/discussions/1906
      gl={{ preserveDrawingBuffer: true }} // for "Save Image As..." and snapshot feature to work
      {...canvasProps}
    >
      <ambientLight />
      {children}
    </Canvas>
  );
}

export default R3FCanvas;
