import type { Axis } from '@h5web/shared';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import AxialSelectionTool from './AxialSelectionTool';
import SvgElement from './SvgElement';
import Box from './box';
import { useZoomOnSelection } from './hooks';
import type { CommonInteractionProps } from './models';
import { getSvgRectCoords } from './utils';

const MIN_SIZE = 20;

interface Props extends CommonInteractionProps {
  axis: Axis;
}

function AxialSelectToZoom(props: Props) {
  const { axis, modifierKey, disabled } = props;

  const { visRatio } = useVisCanvasContext();
  const zoomOnSelection = useZoomOnSelection();

  return (
    <AxialSelectionTool
      axis={axis}
      id={`${axis.toUpperCase()}SelectToZoom`}
      modifierKey={modifierKey}
      disabled={visRatio !== undefined || disabled}
      validate={({ html }) => Box.fromPoints(...html).hasMinSize(MIN_SIZE)}
      onValidSelection={zoomOnSelection}
    >
      {({ html: htmlSelection }, _, isValid) => (
        <SvgElement>
          <rect
            {...getSvgRectCoords(htmlSelection)}
            fill="white"
            fillOpacity={isValid ? 0.25 : 0}
            stroke="black"
            strokeDasharray={isValid ? undefined : 4}
            style={{ transition: 'fill-opacity 0.2s' }}
          />
        </SvgElement>
      )}
    </AxialSelectionTool>
  );
}

export type { Props as AxialSelectToZoomProps };
export default AxialSelectToZoom;
