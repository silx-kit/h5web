import { Canvas } from '@react-three/fiber';
import { useMeasure } from '@react-hookz/web';
import styles from './VisCanvas.module.css';
import { computeCanvasSize, getAxisOffsets } from '../utils';
import type { AxisSystemProviderProps } from './AxisSystemProvider';
import AxisSystemProvider from './AxisSystemProvider';
import AxisSystem from './AxisSystem';

interface Props extends AxisSystemProviderProps {
  aspectRatio?: number;
  title?: string;
}

function VisCanvas(props: Props) {
  const { aspectRatio, title, children, ...providerProps } = props;
  const { abscissaConfig, ordinateConfig } = providerProps;

  const [visAreaSize, visAreaRef] = useMeasure<HTMLDivElement>();
  if (!visAreaSize) {
    return <div ref={visAreaRef} className={styles.visArea} />;
  }

  const axisOffsets = getAxisOffsets({
    left: !!ordinateConfig.label,
    bottom: !!abscissaConfig.label,
    top: !!title,
  });

  const availableSize = {
    width: visAreaSize.width - axisOffsets.left - axisOffsets.right,
    height: visAreaSize.height - axisOffsets.bottom - axisOffsets.top,
  };

  const visSize = computeCanvasSize(availableSize, aspectRatio);

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
          dpr={[1, 3]} // https://discoverthreejs.com/tips-and-tricks/#performance
          gl={{ preserveDrawingBuffer: true }} // for screenshot feature
        >
          <ambientLight />
          <AxisSystemProvider {...providerProps}>
            <AxisSystem axisOffsets={axisOffsets} title={title} />
            {children}
          </AxisSystemProvider>
        </Canvas>
      </div>
    </div>
  );
}

export type { Props as VisCanvasProps };
export default VisCanvas;
