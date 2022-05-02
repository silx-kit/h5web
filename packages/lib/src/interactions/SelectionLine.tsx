import { useThree } from '@react-three/fiber';
import type { SVGProps } from 'react';
import type { Vector2 } from 'three';

import { useCameraState } from '../vis/hooks';
import Overlay from '../vis/shared/Overlay';
import { dataToHtml } from '../vis/utils';

interface Props extends SVGProps<SVGLineElement> {
  startPoint: Vector2;
  endPoint: Vector2;
}

function SelectionLine(props: Props) {
  const { startPoint, endPoint, stroke = 'black', ...restSvgProps } = props;

  const { width, height } = useThree((state) => state.size);

  const htmlSelection = useCameraState(
    (...args) => ({
      startPoint: dataToHtml(...args, startPoint),
      endPoint: dataToHtml(...args, endPoint),
    }),
    [startPoint, endPoint]
  );

  const { x: x1, y: y1 } = htmlSelection.startPoint;
  const { x: x2, y: y2 } = htmlSelection.endPoint;

  return (
    <Overlay>
      <svg width={width} height={height}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={stroke}
          {...restSvgProps}
        />
      </svg>
    </Overlay>
  );
}

export default SelectionLine;
