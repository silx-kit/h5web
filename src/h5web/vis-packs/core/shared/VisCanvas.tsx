import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useMeasure } from '@react-hookz/web';
import styles from './VisCanvas.module.css';
import type { AxisOffsets } from '../models';
import { computeVisSize } from '../utils';

interface Props {
  axisOffsets: AxisOffsets;
  aspectRatio?: number;
  children: ReactNode;
}

function VisCanvas(props: Props) {
  const { axisOffsets, children, aspectRatio } = props;

  const [visAreaSize, visAreaRef] = useMeasure<HTMLDivElement>();

  if (!visAreaSize) {
    return <div ref={visAreaRef} className={styles.visArea} />;
  }

  const availableSize = {
    width: visAreaSize.width - axisOffsets.left - axisOffsets.right,
    height: visAreaSize.height - axisOffsets.bottom - axisOffsets.top,
  };

  const visSize = computeVisSize(availableSize, aspectRatio);

  return (
    <div ref={visAreaRef} className={styles.visArea}>
      <div
        className={styles.vis}
        style={{
          ...visSize,
          paddingBottom: axisOffsets.bottom,
          paddingLeft: axisOffsets.left,
          paddingTop: axisOffsets.top,
          paddingRight: axisOffsets.right,
          boxSizing: 'content-box',
        }}
      >
        <Canvas
          className={styles.canvasWrapper}
          orthographic
          linear // disable automatic color encoding and gamma correction
          frameloop="demand" // disable game loop
          dpr={Math.min(window.devicePixelRatio, 3)} // https://discoverthreejs.com/tips-and-tricks/#performance
          gl={{ preserveDrawingBuffer: true }} // for screenshot feature
        >
          <ambientLight />
          {children}
        </Canvas>
      </div>
    </div>
  );
}

export default VisCanvas;
