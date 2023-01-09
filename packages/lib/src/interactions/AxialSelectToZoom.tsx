import type { Axis } from '@h5web/shared';

import SvgRect from '../svg/SvgRect';
import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import AxialSelectionTool from './AxialSelectionTool';
import Box from './box';
import { useZoomOnSelection } from './hooks';
import type { Selection, CommonInteractionProps } from './models';

interface Props extends CommonInteractionProps {
  axis: Axis;
}

function AxialSelectToZoom(props: Props) {
  const { axis, modifierKey, disabled } = props;

  const { visRatio } = useVisCanvasContext();
  const zoomOnSelection = useZoomOnSelection();

  function onSelectionEnd(selection: Selection) {
    const { size } = Box.fromPoints(...selection.html);
    if (size.width > 0 && size.height > 0) {
      zoomOnSelection(selection);
    }
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
