import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { TooltipWithBounds, useTooltip } from '@visx/tooltip';
import { Line } from '@visx/shape';
import Html from './Html';
import styles from './TooltipMesh.module.css';
import { useCanvasScales } from '../hooks';
import type { ThreeEvent } from '@react-three/fiber/dist/declarations/src/core/events';

type Coords = [number, number];
type Guides = 'horizontal' | 'vertical' | 'both';

interface Props {
  formatIndex: (t: Coords) => string;
  formatValue: (t: Coords) => string | undefined;
  guides?: Guides;
}

function TooltipMesh(props: Props) {
  const { formatIndex, formatValue, guides } = props;

  const camera = useThree((state) => state.camera);
  const { width, height } = useThree((state) => state.size);

  // Scales to compute data coordinates from unprojected mesh coordinates
  const { abscissaScale, ordinateScale } = useCanvasScales();

  const {
    tooltipOpen,
    tooltipTop,
    tooltipLeft,
    tooltipData,
    showTooltip,
    hideTooltip,
  } = useTooltip<Coords>();

  // Update tooltip when pointer moves
  // When panning, events are handled and stopped by texture mesh and do not reach this mesh (which is behind)
  const onPointerMove = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { zoom } = camera;
      const projectedPoint = camera.worldToLocal(evt.unprojectedPoint.clone());

      const abscissaCoord = abscissaScale.invert(evt.unprojectedPoint.x);
      const ordinateCoord = ordinateScale.invert(evt.unprojectedPoint.y);

      showTooltip({
        tooltipLeft: projectedPoint.x * zoom + width / 2,
        tooltipTop: -projectedPoint.y * zoom + height / 2,
        tooltipData: [abscissaCoord, ordinateCoord],
      });
    },
    [camera, abscissaScale, ordinateScale, showTooltip, width, height]
  );

  // Hide tooltip when pointer leaves mesh or user starts panning
  const onPointerOut = useCallback(hideTooltip, [hideTooltip]);
  const onPointerDown = useCallback(hideTooltip, [hideTooltip]);

  // Show tooltip after dragging unless pointer has left canvas
  const onPointerUp = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { offsetX: x, offsetY: y } = evt;
      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        onPointerMove(evt);
      }
    },
    [height, onPointerMove, width]
  );

  const value = tooltipData && formatValue(tooltipData);

  return (
    <>
      <mesh {...{ onPointerMove, onPointerOut, onPointerDown, onPointerUp }}>
        <meshBasicMaterial opacity={0} transparent />
        <planeGeometry args={[width, height]} />
      </mesh>
      <Html>
        {tooltipOpen && tooltipData && value && (
          <>
            <TooltipWithBounds
              key={Math.random()}
              className={styles.tooltip}
              top={tooltipTop}
              left={tooltipLeft}
            >
              {formatIndex(tooltipData)}
              <span className={styles.tooltipValue}>{value}</span>
            </TooltipWithBounds>
            {guides && (
              <svg className={styles.guides} width={width} height={height}>
                {guides !== 'horizontal' && (
                  <Line
                    from={{ x: tooltipLeft, y: 0 }}
                    to={{ x: tooltipLeft, y: height }}
                  />
                )}
                {guides !== 'vertical' && (
                  <Line
                    from={{ x: 0, y: tooltipTop }}
                    to={{ x: width, y: tooltipTop }}
                  />
                )}
              </svg>
            )}
          </>
        )}
      </Html>
    </>
  );
}

export default TooltipMesh;
