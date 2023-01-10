import type { Axis } from '@h5web/shared';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import AxialSelectionTool from './AxialSelectionTool';
import SvgElement from './SvgElement';
import Box from './box';
import { useZoomOnSelection } from './hooks';
import type { Selection, CommonInteractionProps } from './models';
import { getSvgRectCoords } from './utils';

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
      {({ html: htmlSelection }) => (
        <SvgElement>
          <rect
            {...getSvgRectCoords(htmlSelection)}
            fill="white"
            stroke="black"
            fillOpacity={0.25}
          />
        </SvgElement>
      )}
    </AxialSelectionTool>
  );
}

export type { Props as AxialSelectToZoomProps };
export default AxialSelectToZoom;
