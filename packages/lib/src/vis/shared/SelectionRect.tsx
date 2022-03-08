import { useThree } from '@react-three/fiber';
import type { SVGProps } from 'react';
import type { Vector2 } from 'three';

import { useAxisSystemContext } from './AxisSystemContext';
import Html from './Html';

interface Props extends SVGProps<SVGRectElement> {
  startPoint: Vector2;
  endPoint: Vector2;
}

function SelectionRect(props: Props) {
  const {
    startPoint: dataStartPoint,
    endPoint: dataEndPoint,
    fill = 'red',
    fillOpacity = 0.5,
    ...restSvgProps
  } = props;

  const { width, height } = useThree((state) => state.size);

  const { dataToWorld, worldToHtml } = useAxisSystemContext();

  const htmlStartPt = worldToHtml(dataToWorld(dataStartPoint));
  const htmlEndPt = worldToHtml(dataToWorld(dataEndPoint));

  return (
    <Html>
      <svg width={width} height={height}>
        <rect
          x={Math.min(htmlStartPt.x, htmlEndPt.x)}
          y={Math.min(htmlStartPt.y, htmlEndPt.y)}
          width={Math.abs(htmlEndPt.x - htmlStartPt.x)}
          height={Math.abs(htmlEndPt.y - htmlStartPt.y)}
          fill={fill}
          fillOpacity={fillOpacity}
          {...restSvgProps}
        />
      </svg>
    </Html>
  );
}

export default SelectionRect;
