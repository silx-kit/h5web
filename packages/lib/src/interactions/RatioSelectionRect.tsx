import type { SVGProps } from 'react';
import type { Vector2 } from 'three';

import { useAxisSystemContext } from '../vis/shared/AxisSystemContext';
import SelectionRect from './SelectionRect';
import { clampRectangleToVis, getRatioRespectingRectangle } from './utils';

interface Props extends SVGProps<SVGRectElement> {
  startPoint: Vector2;
  endPoint: Vector2;
  ratio: number;
  clampCenter?: boolean;
}

function RatioSelectionRect(props: Props) {
  const { startPoint, endPoint, ratio, clampCenter, ...svgProps } = props;

  const { dataToWorld, worldToData, visSize } = useAxisSystemContext();

  const [ratioStartPoint, ratioEndPoint] = getRatioRespectingRectangle(
    startPoint,
    endPoint,
    ratio,
    clampCenter
  );
  const [newStartPoint, newEndPoint] = clampRectangleToVis(
    dataToWorld(ratioStartPoint),
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
