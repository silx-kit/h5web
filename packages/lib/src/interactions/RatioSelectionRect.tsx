import type { SVGProps } from 'react';
import type { Vector2 } from 'three';

import { useAxisSystemContext } from '../vis/shared/AxisSystemProvider';
import SelectionRect from './SelectionRect';
import { clampRectangleToVis, getRatioRespectingRectangle } from './utils';

interface Props extends SVGProps<SVGRectElement> {
  startPoint: Vector2;
  endPoint: Vector2;
  ratio: number;
}

function RatioSelectionRect(props: Props) {
  const { startPoint, endPoint, ratio, ...svgProps } = props;
  const { visSize, dataToWorld, worldToData } = useAxisSystemContext();

  const [dataStartPoint, dataEndPoint] = getRatioRespectingRectangle(
    startPoint,
    endPoint,
    ratio
  ).map(dataToWorld);

  const [worldStartPoint, worldEndPoint] = clampRectangleToVis(
    dataStartPoint,
    dataEndPoint,
    visSize
  ).map(worldToData);

  return (
    <SelectionRect
      startPoint={worldStartPoint}
      endPoint={worldEndPoint}
      {...svgProps}
    />
  );
}

export default RatioSelectionRect;
