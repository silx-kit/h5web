import type { Axis } from '@h5web/shared';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import AxialSelectionTool from './AxialSelectionTool';
import styles from './SelectToZoom.module.css';
import Box from './box';
import { useZoomOnSelection } from './hooks';
import type { CommonInteractionProps } from './models';
import SvgElement from './svg/SvgElement';
import SvgRect from './svg/SvgRect';

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
          <SvgRect
            className={styles.rawSelection}
            coords={htmlSelection}
            strokePosition="inside"
            data-valid={isValid || undefined}
          />
        </SvgElement>
      )}
    </AxialSelectionTool>
  );
}

export type { Props as AxialSelectToZoomProps };
export default AxialSelectToZoom;
