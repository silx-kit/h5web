import type { ThreeEvent } from '@react-three/fiber';
import { useTooltip } from '@visx/tooltip';
import type { ReactElement } from 'react';
import { useCallback } from 'react';

import type { Coords, Size } from '../models';
import TooltipOverlay from './TooltipOverlay';
import { useVisCanvasContext } from './VisCanvasProvider';
import VisMesh from './VisMesh';

interface Props {
  size?: Size;
  guides?: 'horizontal' | 'vertical' | 'both';
  renderTooltip: (x: number, y: number) => ReactElement | undefined;
}

function TooltipMesh(props: Props) {
  const { guides, renderTooltip, size } = props;
  const { canvasSize, worldToData } = useVisCanvasContext();
  const { width, height } = canvasSize;

  const {
    tooltipOpen,
    tooltipTop,
    tooltipLeft,
    tooltipData,
    showTooltip,
    hideTooltip,
  } = useTooltip<Coords>();

  // Show and/or update tooltip when pointer moves except when dragging
  const onPointerMove = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { unprojectedPoint, sourceEvent } = evt;

      // Keep tooltip hidden when dragging
      if (sourceEvent.buttons !== 0) {
        return;
      }

      const dataCoords = worldToData(unprojectedPoint);
      showTooltip({
        tooltipLeft: sourceEvent.offsetX,
        tooltipTop: sourceEvent.offsetY,
        tooltipData: [dataCoords.x, dataCoords.y],
      });
    },
    [worldToData, showTooltip]
  );

  // Hide tooltip when pointer leaves mesh
  const onPointerOut = useCallback(() => {
    /* `onPointerOut` is called after `onPointerUp` for some reason,
     * so we make sure not to hide the tooltip again in this case. */
    if (tooltipOpen) {
      hideTooltip();
    }
  }, [hideTooltip, tooltipOpen]);

  // Hide tooltip when user starts panning
  const onPointerDown = useCallback(() => hideTooltip(), [hideTooltip]);

  // Show tooltip after dragging, if pointer is released inside the vis viewport
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
      <VisMesh
        {...{ onPointerMove, onPointerOut, onPointerDown, onPointerUp }}
        size={size}
      >
        <meshBasicMaterial opacity={0} transparent />
      </VisMesh>
      <TooltipOverlay
        tooltipOpen={tooltipOpen}
        tooltipLeft={tooltipLeft}
        tooltipTop={tooltipTop}
        guides={guides}
      >
        {content}
      </TooltipOverlay>
    </>
  );
}

export type { Props as TooltipMeshProps };
export default TooltipMesh;
