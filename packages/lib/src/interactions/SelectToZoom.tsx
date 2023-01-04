import { useThree } from '@react-three/fiber';

import SvgRect from '../svg/SvgRect';
import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import SelectionTool from './SelectionTool';
import Box from './box';
import { useZoomOnBox } from './hooks';
import type { CommonInteractionProps, Rect3, Selection } from './models';

type Props = CommonInteractionProps;

function SelectToZoom(props: Props) {
  const { canvasSize, canvasRatio, visRatio, visSize } = useVisCanvasContext();

  const { width, height } = canvasSize;
  const keepRatio = visRatio !== undefined;

  const camera = useThree((state) => state.camera);
  const zoomOnBox = useZoomOnBox();

  function computeZoomBox(worldSelection: Rect3): Box {
    const { position, scale } = camera;
    const zoomBox = Box.fromPoints(...worldSelection);

    if (!keepRatio) {
      return zoomBox;
    }

    const visBox = Box.fromSize(visSize);
    const fovBox = Box.empty(position).expandBySize(
      width * scale.x,
      height * scale.y
    );

    return zoomBox
      .expandToRatio(canvasRatio)
      .keepWithin(visBox) // when zoomed out and canvas/vis ratios differ
      .keepWithin(fovBox); // when zoomed in
  }

  function onSelectionEnd(selection: Selection) {
    const [worldStart, worldEnd] = selection.world;
    if (worldStart.x === worldEnd.x || worldStart.y === worldEnd.y) {
      return;
    }

    zoomOnBox(computeZoomBox(selection.world));
  }

  return (
    <SelectionTool id="SelectToZoom" onSelectionEnd={onSelectionEnd} {...props}>
      {({ world: worldSelection }) => {
        const zoomBox = computeZoomBox(worldSelection);

        return (
          <>
            <SvgRect
              coords={worldSelection}
              fill="white"
              stroke="black"
              fillOpacity={keepRatio ? 0 : 0.25}
              strokeDasharray={keepRatio ? '4' : undefined}
            />
            {keepRatio && (
              <SvgRect
                coords={[zoomBox.min, zoomBox.max]}
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
