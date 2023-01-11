import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import styles from './SelectToZoom.module.css';
import SelectionTool from './SelectionTool';
import Box from './box';
import { useZoomOnSelection } from './hooks';
import type { CommonInteractionProps, Rect, Selection } from './models';
import SvgElement from './svg/SvgElement';
import SvgRect from './svg/SvgRect';

const MIN_SIZE = 20;

type Props = CommonInteractionProps;

function SelectToZoom(props: Props) {
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
      validate={({ html }) => Box.fromPoints(...html).hasMinSize(MIN_SIZE)}
      onValidSelection={zoomOnSelection}
      {...props}
    >
      {({ html: htmlSelection }, { html: rawHtmlSelection }, isValid) => (
        <SvgElement>
          <SvgRect
            className={styles.rawSelection}
            coords={rawHtmlSelection}
            strokePosition="inside"
            data-valid={(!keepRatio && isValid) || undefined}
          />
          {keepRatio && (
            <SvgRect
              className={styles.selection}
              coords={htmlSelection}
              strokePosition="inside"
              data-valid={isValid || undefined}
            />
          )}
        </SvgElement>
      )}
    </SelectionTool>
  );
}

export type { Props as SelectToZoomProps };
export default SelectToZoom;
