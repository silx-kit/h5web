import { useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Line } from '@visx/shape';
import { TooltipWithBounds, useTooltip } from '@visx/tooltip';
import { useCallback } from 'react';
import type { ReactElement } from 'react';

import type { Coords } from '../models';
import { useAxisSystemContext } from './AxisSystemContext';
import Html from './Html';
import styles from './TooltipMesh.module.css';
import VisMesh from './VisMesh';

interface Props {
  guides?: 'horizontal' | 'vertical' | 'both';
  renderTooltip: (x: number, y: number) => ReactElement | undefined;
}

function TooltipMesh(props: Props) {
  const { guides, renderTooltip } = props;

  const { width, height } = useThree((state) => state.size);

  // Scales to compute data coordinates from unprojected mesh coordinates
  const { worldToData, worldToHtml } = useAxisSystemContext();

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
      const dataCoords = worldToData(evt.unprojectedPoint);

      const htmlPoint = worldToHtml(evt.unprojectedPoint);

      showTooltip({
        tooltipLeft: htmlPoint.x,
        tooltipTop: htmlPoint.y,
        tooltipData: [dataCoords.x, dataCoords.y],
      });
    },
    [worldToData, worldToHtml, showTooltip]
  );

  // Hide tooltip when pointer leaves mesh or user starts panning
  const onPointerOut = useCallback(hideTooltip, [hideTooltip]);
  const onPointerDown = useCallback(hideTooltip, [hideTooltip]);

  // Show tooltip after dragging unless pointer has left canvas
  const onPointerUp = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { sourceEvent } = evt;
      const { offsetX: x, offsetY: y } = sourceEvent;
      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        onPointerMove(evt);
      }
    },
    [height, onPointerMove, width]
  );

  const content = tooltipData && renderTooltip(...tooltipData);

  return (
    <>
      <VisMesh {...{ onPointerMove, onPointerOut, onPointerDown, onPointerUp }}>
        <meshBasicMaterial opacity={0} transparent />
      </VisMesh>
      <Html style={{ width, height }}>
        {tooltipOpen && content && (
          <>
            <TooltipWithBounds
              key={Math.random()}
              className={styles.tooltip}
              top={tooltipTop}
              left={tooltipLeft}
              unstyled
              applyPositionStyle
            >
              {content}
            </TooltipWithBounds>
            {guides && (
              <svg className={styles.guides}>
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

export type { Props as TooltipMeshProps };
export default TooltipMesh;
