import type { SVGProps } from 'react';
import type { Vector2 } from 'three';

import { useAxisSystemContext } from '../vis/shared/AxisSystemContext';
import SelectionRect from './SelectionRect';
import { clampRectangleToVis, getRatioEndPoint } from './utils';

interface Props extends SVGProps<SVGRectElement> {
  startPoint: Vector2;
  endPoint: Vector2;
  ratio: number;
}

function RatioSelectionRect(props: Props) {
  const { startPoint, endPoint, ratio, ...svgProps } = props;

  const { dataToWorld, worldToData, visSize } = useAxisSystemContext();

  const ratioEndPoint = getRatioEndPoint(startPoint, endPoint, ratio);
  const [newStartPoint, newEndPoint] = clampRectangleToVis(
    dataToWorld(startPoint),
    dataToWorld(ratioEndPoint),
    visSize
  );

  return (
    <SelectionRect
      startPoint={worldToData(newStartPoint)}
      endPoint={worldToData(newEndPoint)}
      {...svgProps}
    />
  );
}

export default RatioSelectionRect;
