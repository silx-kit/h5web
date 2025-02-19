import { useToggle } from '@react-hookz/web';
import { type ThreeEvent } from '@react-three/fiber';
import { useTooltip } from '@visx/tooltip';
import { type ReactElement, useCallback } from 'react';

import { type Coords, type Size } from '../models';
import TooltipOverlay from './TooltipOverlay';
import { useVisCanvasContext } from './VisCanvasProvider';
import VisMesh from './VisMesh';

interface Props {
  size?: Size;
  guides?: 'horizontal' | 'vertical' | 'both';
  renderTooltip: (
    x: number,
    y: number,
    exact: boolean,
  ) => ReactElement | undefined;
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

  const [isExact, toggleExact] = useToggle();

  // Show and/or update tooltip when pointer moves except when dragging
  const onPointerMove = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { unprojectedPoint, nativeEvent } = evt;

      // Keep tooltip hidden when dragging
      if (nativeEvent.buttons !== 0) {
        return;
      }

      const dataCoords = worldToData(unprojectedPoint);
      showTooltip({
        tooltipLeft: nativeEvent.offsetX,
        tooltipTop: nativeEvent.offsetY,
        tooltipData: [dataCoords.x, dataCoords.y],
      });
    },
    [worldToData, showTooltip],
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
  const onPointerDown = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      if (evt.button === 1) {
        toggleExact();
      } else {
        hideTooltip();
      }
    },
    [hideTooltip, toggleExact],
  );

  // Show tooltip after dragging, if pointer is released inside the vis viewport
  const onPointerUp = useCallback(
    (evt: ThreeEvent<PointerEvent>) => {
      const { nativeEvent } = evt;
      const { offsetX: x, offsetY: y } = nativeEvent;
      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        onPointerMove(evt);
      }
    },
    [height, onPointerMove, width],
  );

  const content = tooltipData && renderTooltip(...tooltipData, isExact);

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
