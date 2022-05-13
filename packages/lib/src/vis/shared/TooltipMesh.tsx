import { useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useTooltip } from '@visx/tooltip';
import { useCallback } from 'react';
import type { ReactElement } from 'react';

import type { Coords } from '../models';
import { useAxisSystemContext } from './AxisSystemProvider';
import TooltipOverlay from './TooltipOverlay';
import VisMesh from './VisMesh';

interface Props {
  guides?: 'horizontal' | 'vertical' | 'both';
  renderTooltip: (x: number, y: number) => ReactElement | undefined;
}

function TooltipMesh(props: Props) {
  const { guides, renderTooltip } = props;

  const { width, height } = useThree((state) => state.size);

  // Scales to compute data coordinates from unprojected mesh coordinates
  const { worldToData } = useAxisSystemContext();

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
      const { nativeEvent } = evt;
      const { offsetX: x, offsetY: y } = nativeEvent;
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
