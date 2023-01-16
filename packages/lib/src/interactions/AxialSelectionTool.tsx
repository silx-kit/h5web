import type { Axis } from '@h5web/shared';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import type { SelectionToolProps } from './SelectionTool';
import SelectionTool from './SelectionTool';
import type { Rect, Selection } from './models';

interface Props extends SelectionToolProps {
  axis: Axis;
}

function AxialSelectionTool(props: Props) {
  const {
    axis,
    onSelectionStart,
    onSelectionChange,
    onSelectionEnd,
    children,
    ...restOfSelectionProps
  } = props;

  const { canvasSize, htmlToWorld, worldToData } = useVisCanvasContext();
  const { width, height } = canvasSize;
  const camera = useThree((state) => state.camera);

  function toAxialSelection(selection: Selection): Selection {
    const [htmlStart, htmlEnd] = selection.html;

    const html: Rect =
      axis === 'x'
        ? [new Vector3(htmlStart.x, 0), new Vector3(htmlEnd.x, height)]
        : [new Vector3(0, htmlStart.y), new Vector3(width, htmlEnd.y)];

    const world = html.map((pt) => htmlToWorld(camera, pt)) as Rect;
    const data = world.map(worldToData) as Rect;

    return { html, world, data };
  }

  return (
    <SelectionTool
      transform={toAxialSelection}
      onSelectionStart={onSelectionStart}
      onSelectionChange={onSelectionChange}
      onSelectionEnd={onSelectionEnd}
      {...restOfSelectionProps}
    >
      {children}
    </SelectionTool>
  );
}

export type { Props as AxialSelectionToolProps };
export default AxialSelectionTool;
