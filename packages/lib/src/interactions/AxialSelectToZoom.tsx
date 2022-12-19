import type { Axis } from '@h5web/shared';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import AxialSelectionTool from './AxialSelectionTool';
import SelectionRect from './SelectionRect';
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
      {({ data: [dataStart, dataEnd] }) => (
        <SelectionRect
          startPoint={dataStart}
          endPoint={dataEnd}
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
