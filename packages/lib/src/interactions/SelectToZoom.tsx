import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import SelectionTool from './SelectionTool';
import SvgElement from './SvgElement';
import Box from './box';
import { useZoomOnSelection } from './hooks';
import type { CommonInteractionProps, Rect, Selection } from './models';
import { getSvgRectCoords } from './utils';

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

  function onSelectionEnd(selection: Selection) {
    const { size } = Box.fromPoints(...selection.html);
    if (size.width > 0 && size.height > 0) {
      zoomOnSelection(selection);
    }
  }

  return (
    <SelectionTool
      id="SelectToZoom"
      transformSelection={computeZoomSelection}
      onSelectionEnd={onSelectionEnd}
      {...props}
    >
      {({ html: htmlSelection }, { html: rawHtmlSelection }) => (
        <SvgElement>
          <rect
            {...getSvgRectCoords(htmlSelection)}
            fill="white"
            fillOpacity={keepRatio ? 0 : 0.25}
            stroke="black"
            strokeDasharray={keepRatio ? '4' : undefined}
          />
          {keepRatio && (
            <rect
              {...getSvgRectCoords(rawHtmlSelection)}
              fill="white"
              fillOpacity={0.25}
              stroke="black"
            />
          )}
        </SvgElement>
      )}
    </SelectionTool>
  );
}

export type { Props as SelectToZoomProps };
export default SelectToZoom;
