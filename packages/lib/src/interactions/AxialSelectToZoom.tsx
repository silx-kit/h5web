import type { Axis } from '@h5web/shared';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import AxialSelectionTool from './AxialSelectionTool';
import styles from './SelectToZoom.module.css';
import Box from './box';
import { useZoomOnSelection } from './hooks';
import type { CommonInteractionProps } from './models';
import SvgElement from './svg/SvgElement';
import SvgRect from './svg/SvgRect';

const DEFAULT_MIN_ZOOM = 20;

interface Props extends CommonInteractionProps {
  axis: Axis;
  minZoom?: number;
}

function AxialSelectToZoom(props: Props) {
  const { axis, modifierKey, disabled, minZoom = DEFAULT_MIN_ZOOM } = props;

  const { visRatio } = useVisCanvasContext();
  const zoomOnSelection = useZoomOnSelection();

  return (
    <AxialSelectionTool
      axis={axis}
      id={`${axis.toUpperCase()}SelectToZoom`}
      modifierKey={modifierKey}
      disabled={visRatio !== undefined || disabled}
      validate={({ html }) => Box.fromPoints(...html).hasMinSize(minZoom)}
      onValidSelection={zoomOnSelection}
    >
      {({ html: htmlSelection }, _, isValid) => (
        <SvgElement>
          <SvgRect
            className={styles.selection}
            coords={htmlSelection}
            fill="white"
            fillOpacity={isValid ? 0.25 : 0}
            stroke="black"
            strokePosition="inside"
            strokeDasharray={!isValid ? 4 : undefined}
          />
        </SvgElement>
      )}
    </AxialSelectionTool>
  );
}

export type { Props as AxialSelectToZoomProps };
export default AxialSelectToZoom;
