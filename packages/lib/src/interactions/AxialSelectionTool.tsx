import { type Axis } from '@h5web/shared';
import { type Camera, Vector3 } from 'three';

import { type VisCanvasContextValue } from '../vis/shared/VisCanvasProvider';
import { type Rect, type Selection } from './models';
import SelectionTool, { type SelectionToolProps } from './SelectionTool';

interface Props extends Omit<SelectionToolProps, 'transform'> {
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

  function toAxialSelection(
    selection: Selection,
    camera: Camera,
    context: VisCanvasContextValue
  ): Selection {
    const { canvasSize, htmlToWorld, worldToData } = context;
    const { width, height } = canvasSize;

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

export { type Props as AxialSelectionToolProps };
export default AxialSelectionTool;
