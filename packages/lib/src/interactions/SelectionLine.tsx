import { useThree } from '@react-three/fiber';
import type { SVGProps } from 'react';
import type { Vector2 } from 'three';

import { useAxisSystemContext } from '../vis/shared/AxisSystemContext';
import Overlay from '../vis/shared/Overlay';

interface Props extends SVGProps<SVGLineElement> {
  startPoint: Vector2;
  endPoint: Vector2;
}

function SelectionLine(props: Props) {
  const {
    startPoint: dataStartPoint,
    endPoint: dataEndPoint,
    stroke = 'black',
    ...restSvgProps
  } = props;

  const { width, height } = useThree((state) => state.size);

  const { dataToWorld, worldToHtml } = useAxisSystemContext();

  const htmlStartPt = worldToHtml(dataToWorld(dataStartPoint));
  const htmlEndPt = worldToHtml(dataToWorld(dataEndPoint));

  return (
    <Overlay>
      <svg width={width} height={height}>
        <line
          x1={htmlStartPt.x}
          y1={htmlStartPt.y}
          x2={htmlEndPt.x}
          y2={htmlEndPt.y}
          stroke={stroke}
          {...restSvgProps}
        />
      </svg>
    </Overlay>
  );
}

export default SelectionLine;
