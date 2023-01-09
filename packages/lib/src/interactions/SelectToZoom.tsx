import { useThree } from '@react-three/fiber';

import SvgRect from '../svg/SvgRect';
import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import SelectionTool from './SelectionTool';
import Box from './box';
import { useZoomOnSelection } from './hooks';
import type { CommonInteractionProps, Selection } from './models';

type Props = CommonInteractionProps;

function SelectToZoom(props: Props) {
  const { canvasSize, canvasRatio, visRatio, visSize, worldToData } =
    useVisCanvasContext();

  const { width, height } = canvasSize;
  const keepRatio = visRatio !== undefined;

  const camera = useThree((state) => state.camera);
  const zoomOnSelection = useZoomOnSelection();

  function computeZoomSelection(selection: Selection): Selection {
    if (!keepRatio) {
      return selection;
    }

    const { position, scale } = camera;
    const { world: worldSelection } = selection;

    const zoomBox = Box.fromPoints(...worldSelection);
    const visBox = Box.fromSize(visSize);
    const fovBox = Box.empty(position).expandBySize(
      width * scale.x,
      height * scale.y
    );

    zoomBox
      .expandToRatio(canvasRatio)
      .keepWithin(visBox) // when zoomed out and canvas/vis ratios differ
      .keepWithin(fovBox); // when zoomed in

    return {
      world: [zoomBox.min, zoomBox.max],
      data: [worldToData(zoomBox.min), worldToData(zoomBox.max)],
    };
  }

  function onSelectionEnd(selection: Selection) {
    const [worldStart, worldEnd] = selection.world;
    if (worldStart.x === worldEnd.x || worldStart.y === worldEnd.y) {
      return;
    }

    zoomOnSelection(selection);
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
