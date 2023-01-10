import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

import SvgRect from '../svg/SvgRect';
import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import SelectionTool from './SelectionTool';
import Box from './box';
import { useZoomOnSelection } from './hooks';
import type { CommonInteractionProps, Rect, Selection } from './models';

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
      {({ world: worldSelection }, { world: rawWorldSelection }) => {
        return (
          <>
            <SvgRect
              coords={rawWorldSelection}
              fill="white"
              stroke="black"
              fillOpacity={keepRatio ? 0 : 0.25}
              strokeDasharray={keepRatio ? '4' : undefined}
            />
            {keepRatio && (
              <SvgRect
                coords={worldSelection}
                fillOpacity={0.25}
                fill="white"
                stroke="black"
              />
            )}
          </>
        );
      }}
    </SelectionTool>
  );
}

export type { Props as SelectToZoomProps };
export default SelectToZoom;
