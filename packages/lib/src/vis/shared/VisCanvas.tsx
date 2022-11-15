import { Canvas } from '@react-three/fiber';
import type { PropsWithChildren } from 'react';
import { useRef } from 'react';

import InteractionsProvider from '../../interactions/InteractionsProvider';
import type { AxisConfig } from '../models';
import { getAxisOffsets } from '../utils';
import AxisSystem from './AxisSystem';
import AxisSystemProvider from './AxisSystemProvider';
import RatioEnforcer from './RatioEnforcer';
import ThresholdAdjuster from './ThresholdAdjuster';
import ViewportCenterer from './ViewportCenterer';
import styles from './VisCanvas.module.css';

const NO_OFFSETS = { left: 0, right: 0, top: 0, bottom: 0 };

interface Props {
  title?: string;
  visRatio?: number | undefined;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  raycasterThreshold?: number;
  showAxes?: boolean;
}

function VisCanvas(props: PropsWithChildren<Props>) {
  const {
    title,
    visRatio,
    abscissaConfig,
    ordinateConfig,
    raycasterThreshold,
    showAxes = true,
    children,
  } = props;

  const axisOffsets = showAxes
    ? getAxisOffsets({
        left: !!ordinateConfig.label,
        bottom: !!abscissaConfig.label,
        top: !!title,
      })
    : NO_OFFSETS;

  const floatingToolbarRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={styles.canvasWrapper}
      style={{
        paddingBottom: axisOffsets.bottom,
        paddingLeft: axisOffsets.left,
        paddingTop: axisOffsets.top,
        paddingRight: axisOffsets.right,
      }}
    >
      <Canvas
        className={styles.r3fRoot}
        orthographic
        linear // disable automatic color encoding and gamma correction
        flat // disable tone mapping
        frameloop="demand" // disable game loop
        dpr={[1, 3]} // https://discoverthreejs.com/tips-and-tricks/#performance
        gl={{ preserveDrawingBuffer: true }} // for screenshot feature
        resize={{ debounce: { scroll: 20, resize: 200 }, scroll: false }} // https://github.com/pmndrs/react-three-fiber/discussions/1906
      >
        <ambientLight />
        <AxisSystemProvider
          visRatio={visRatio}
          abscissaConfig={abscissaConfig}
          ordinateConfig={ordinateConfig}
          floatingToolbar={floatingToolbarRef.current}
        >
          <InteractionsProvider>
            <AxisSystem
              axisOffsets={axisOffsets}
              title={title}
              showAxes={showAxes}
            />
            {children}
            <ViewportCenterer />
            <RatioEnforcer visRatio={visRatio} />
            {raycasterThreshold !== undefined && (
              <ThresholdAdjuster value={raycasterThreshold} />
            )}
          </InteractionsProvider>
        </AxisSystemProvider>
      </Canvas>

      <div ref={floatingToolbarRef} className={styles.floatingToolbar} />
    </div>
  );
}

export type { Props as VisCanvasProps };
export default VisCanvas;
