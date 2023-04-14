import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import Box from './box';
import { useZoomOnSelection } from './hooks';
import {
  type CommonInteractionProps,
  type Rect,
  type Selection,
} from './models';
import SelectionTool from './SelectionTool';
import styles from './SelectToZoom.module.css';
import SvgElement from './svg/SvgElement';
import SvgRect from './svg/SvgRect';

const DEFAULT_MIN_ZOOM = 20;

interface Props extends CommonInteractionProps {
  minZoom?: number;
}

function SelectToZoom(props: Props) {
  const { minZoom = DEFAULT_MIN_ZOOM, ...commonProps } = props;
  const {
    canvasSize,
    canvasRatio,
    canvasBox,
    visRatio,
    visSize,
    htmlToWorld,
    worldToData,
  } = useVisCanvasContext();

  const zoomOnSelection = useZoomOnSelection();
  const camera = useThree((state) => state.camera);
  const keepRatio = visRatio !== undefined;

  function computeZoomSelection(selection: Selection): Selection {
    if (!keepRatio) {
      return selection;
    }

    const { scale } = camera;
    const scaledVisBox = Box.empty(
      new Vector3(canvasSize.width / 2, canvasSize.height / 2)
    ).expandBySize(visSize.width / scale.x, visSize.height / scale.y);

    const zoomBox = Box.fromPoints(...selection.html)
      .expandToRatio(canvasRatio)
      .keepWithin(canvasBox)
      .keepWithin(scaledVisBox); // in case visualization doesn't cover entire canvas at current zoom level

    const html = zoomBox.toRect();
    const world = html.map((pt) => htmlToWorld(camera, pt)) as Rect;
    const data = world.map(worldToData) as Rect;

    return { html, world, data };
  }

  return (
    <SelectionTool
      id="SelectToZoom"
      transform={computeZoomSelection}
      validate={({ html }) => Box.fromPoints(...html).hasMinSize(minZoom)}
      onValidSelection={zoomOnSelection}
      {...commonProps}
    >
      {({ html: htmlSelection }, { html: rawHtmlSelection }, isValid) => (
        <SvgElement>
          <SvgRect
            className={styles.selection}
            coords={rawHtmlSelection}
            fill="white"
            fillOpacity={!keepRatio && isValid ? 0.25 : 0}
            stroke="black"
            strokePosition="inside"
            strokeDasharray={keepRatio || !isValid ? 4 : undefined}
          />
          {keepRatio && (
            <SvgRect
              className={styles.selection}
              coords={htmlSelection}
              fill="white"
              fillOpacity={isValid ? 0.25 : 0}
              stroke="black"
              strokePosition="inside"
            />
          )}
        </SvgElement>
      )}
    </SelectionTool>
  );
}

export { type Props as SelectToZoomProps };
export default SelectToZoom;
