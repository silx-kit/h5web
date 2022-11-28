import { useThree } from '@react-three/fiber';
import { Vector2 } from 'three';

import { useVisCanvasContext } from '../vis/shared/VisCanvasProvider';
import { getVisibleDomains } from '../vis/utils';
import type { SelectionProps } from './SelectionTool';
import SelectionTool from './SelectionTool';
import type { Selection } from './models';

interface Props extends SelectionProps {
  axis: 'x' | 'y';
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

  const context = useVisCanvasContext();

  const camera = useThree((state) => state.camera);

  function getAxialSelection(selection: Selection): Selection {
    const { xVisibleDomain, yVisibleDomain } = getVisibleDomains(
      camera,
      context
    );

    const { startPoint, endPoint } = selection;
    const axialStartPoint =
      axis === 'x'
        ? new Vector2(startPoint.x, yVisibleDomain[0])
        : new Vector2(xVisibleDomain[0], startPoint.y);
    const axialEndPoint =
      axis === 'x'
        ? new Vector2(endPoint.x, yVisibleDomain[1])
        : new Vector2(xVisibleDomain[1], endPoint.y);

    return {
      startPoint: axialStartPoint,
      endPoint: axialEndPoint,
      worldStartPoint: context.dataToWorld(axialStartPoint),
      worldEndPoint: context.dataToWorld(axialEndPoint),
    };
  }

  return (
    <SelectionTool
      onSelectionStart={onSelectionStart}
      onSelectionChange={
        onSelectionChange &&
        ((selection) => onSelectionChange(getAxialSelection(selection)))
      }
      onSelectionEnd={
        onSelectionEnd &&
        ((selection) => onSelectionEnd(getAxialSelection(selection)))
      }
      {...restOfSelectionProps}
    >
      {(selection) => children(getAxialSelection(selection))}
    </SelectionTool>
  );
}

export default AxialSelectionTool;
