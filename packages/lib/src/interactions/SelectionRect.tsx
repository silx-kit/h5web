import { useThree } from '@react-three/fiber';
import type { SVGProps } from 'react';
import type { Vector2 } from 'three';

import { useCameraState } from '../vis/hooks';
import Overlay from '../vis/shared/Overlay';
import { dataToHtml } from '../vis/utils';
import { clampRectangleToVis } from './utils';

interface Props extends SVGProps<SVGRectElement> {
  startPoint: Vector2;
  endPoint: Vector2;
  clampToVis?: boolean;
}

function SelectionRect(props: Props) {
  const {
    startPoint,
    endPoint,
    fill = 'red',
    fillOpacity = 0.5,
    clampToVis,
    ...restSvgProps
  } = props;

  const { width, height } = useThree((state) => state.size);

  const htmlSelection = useCameraState(
    (camera, context) => {
      const { visSize, dataToWorld, worldToData } = context;
      const [newStartPoint, newEndPoint] = clampToVis
        ? clampRectangleToVis(
            dataToWorld(startPoint),
            dataToWorld(endPoint),
            visSize
          )
        : [dataToWorld(startPoint), dataToWorld(endPoint)];

      return {
        startPoint: dataToHtml(camera, context, worldToData(newStartPoint)),
        endPoint: dataToHtml(camera, context, worldToData(newEndPoint)),
      };
    },
    [startPoint, endPoint, clampToVis]
  );

  const { x: x1, y: y1 } = htmlSelection.startPoint;
  const { x: x2, y: y2 } = htmlSelection.endPoint;

  return (
    <Overlay>
      <svg width={width} height={height}>
        <rect
          x={Math.min(x1, x2)}
          y={Math.min(y1, y2)}
          width={Math.abs(x2 - x1)}
          height={Math.abs(y2 - y1)}
          fill={fill}
          fillOpacity={fillOpacity}
          {...restSvgProps}
        />
      </svg>
    </Overlay>
  );
}

export default SelectionRect;
