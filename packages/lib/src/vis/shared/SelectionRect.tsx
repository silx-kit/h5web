import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

import type { Selection } from '../models';
import { useAxisSystemContext } from './AxisSystemContext';
import Html from './Html';
import { useWorldToHtml } from './hooks';

interface Props extends Selection {
  color?: string;
  opacity?: number;
  borderColor?: string;
}

function SelectionRect(props: Props) {
  const {
    startPoint: dataStartPoint,
    endPoint: dataEndPoint,
    color = 'red',
    opacity = 0.5,
    borderColor,
  } = props;

  const { width, height } = useThree((state) => state.size);

  const { dataToWorld } = useAxisSystemContext();
  const worldToHtml = useWorldToHtml();

  const worldStartPoint = dataToWorld(dataStartPoint);
  const htmlStartPt = worldToHtml(
    new Vector3(worldStartPoint.x, worldStartPoint.y, 0)
  );
  const worldEndPoint = dataToWorld(dataEndPoint);
  const htmlEndPt = worldToHtml(
    new Vector3(worldEndPoint.x, worldEndPoint.y, 0)
  );

  return (
    <Html>
      <svg width={width} height={height}>
        <rect
          x={Math.min(htmlStartPt.x, htmlEndPt.x)}
          y={Math.min(htmlStartPt.y, htmlEndPt.y)}
          width={Math.abs(htmlEndPt.x - htmlStartPt.x)}
          height={Math.abs(htmlEndPt.y - htmlStartPt.y)}
          stroke={borderColor}
          fill={color}
          fillOpacity={opacity}
        />
      </svg>
    </Html>
  );
}

export default SelectionRect;
