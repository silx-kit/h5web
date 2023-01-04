import type { Axis } from '@h5web/shared';

import SvgRect from '../svg/SvgRect';
import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import AxialSelectionTool from './AxialSelectionTool';
import Box from './box';
import { useZoomOnBox } from './hooks';
import type { Selection, CommonInteractionProps } from './models';

interface Props extends CommonInteractionProps {
  axis: Axis;
}

function AxialSelectToZoom(props: Props) {
  const { axis, modifierKey, disabled } = props;

  const { visRatio } = useVisCanvasContext();
  const zoomOnBox = useZoomOnBox();

  function onSelectionEnd({ world: worldSelection }: Selection) {
    const [worldStart, worldEnd] = worldSelection;
    if (worldStart.x === worldEnd.x || worldStart.y === worldEnd.y) {
      return;
    }

    zoomOnBox(Box.fromPoints(...worldSelection));
  }

  return (
    <AxialSelectionTool
      axis={axis}
      id={`${axis.toUpperCase()}SelectToZoom`}
      modifierKey={modifierKey}
      disabled={visRatio !== undefined || disabled}
      onSelectionEnd={onSelectionEnd}
    >
      {(selection) => (
        <SvgRect
          coords={selection.world}
          fill="white"
          stroke="black"
          fillOpacity={0.25}
        />
      )}
    </AxialSelectionTool>
  );
}

export type { Props as AxialSelectToZoomProps };
export default AxialSelectToZoom;
