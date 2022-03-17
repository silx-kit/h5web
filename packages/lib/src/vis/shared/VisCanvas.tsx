import { useMeasure } from '@react-hookz/web';
import { Canvas } from '@react-three/fiber';
import type { PropsWithChildren } from 'react';

import type { InteractionKeys } from '../../interactions/models';
import type { AxisConfig } from '../models';
import { getSizeToFit, getAxisOffsets } from '../utils';
import AxisSystem from './AxisSystem';
import AxisSystemProvider from './AxisSystemProvider';
import ViewportCenterer from './ViewportCenterer';
import styles from './VisCanvas.module.css';

interface Props {
  title?: string;
  canvasRatio?: number | undefined;
  visRatio?: number | undefined;
  abscissaConfig: AxisConfig;
  ordinateConfig: AxisConfig;
  interactionKeys?: InteractionKeys;
}

function VisCanvas(props: PropsWithChildren<Props>) {
  const {
    title,
    canvasRatio,
    visRatio,
    abscissaConfig,
    ordinateConfig,
    children,
    interactionKeys = {},
  } = props;

  const shouldMeasure = !!canvasRatio;
  const [areaSize, areaRef] = useMeasure<HTMLDivElement>(shouldMeasure);
  const canvasSize = areaSize && getSizeToFit(areaSize, canvasRatio);

  const axisOffsets = getAxisOffsets({
    left: !!ordinateConfig.label,
    bottom: !!abscissaConfig.label,
    top: !!title,
  });

  return (
    <div
      ref={areaRef}
      className={styles.canvasArea}
      style={{
        paddingBottom: axisOffsets.bottom,
        paddingLeft: axisOffsets.left,
        paddingTop: axisOffsets.top,
        paddingRight: axisOffsets.right,
      }}
    >
      {(!shouldMeasure || canvasSize) && (
        <div
          className={styles.canvasWrapper}
          style={shouldMeasure ? canvasSize : undefined}
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
              interactionKeys={interactionKeys}
            >
              <AxisSystem axisOffsets={axisOffsets} title={title} />
              {children}
              <ViewportCenterer />
            </AxisSystemProvider>
          </Canvas>
        </div>
      )}
    </div>
  );
}

export type { Props as VisCanvasProps };
export default VisCanvas;
