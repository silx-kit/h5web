import { useThree } from '@react-three/fiber';
import { Vector2 } from 'three';

import { useAxisSystemContext } from '../vis/shared/AxisSystemProvider';
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

  const context = useAxisSystemContext();

  const camera = useThree((state) => state.camera);

  function getAxialSelection(selection: Selection): Selection {
    const { xVisibleDomain, yVisibleDomain } = getVisibleDomains(
      camera,
      context
    );

    const { startPoint: mouseStartPoint, endPoint: mouseEndPoint } = selection;
    const startPoint =
      axis === 'x'
        ? new Vector2(mouseStartPoint.x, yVisibleDomain[0])
        : new Vector2(xVisibleDomain[0], mouseStartPoint.y);
    const endPoint =
      axis === 'x'
        ? new Vector2(mouseEndPoint.x, yVisibleDomain[1])
        : new Vector2(xVisibleDomain[1], mouseEndPoint.y);

    return {
      startPoint,
      endPoint,
      worldStartPoint: context.dataToWorld(startPoint),
      worldEndPoint: context.dataToWorld(endPoint),
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
