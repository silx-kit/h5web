import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

import type { Selection } from '../models';
import { useAxisSystemContext } from './AxisSystemContext';
import Html from './Html';
import { useWorldToHtml } from './hooks';

interface Props extends Selection {
  color?: string;
}

function SelectionLine(props: Props) {
  const {
    startPoint: dataStartPoint,
    endPoint: dataEndPoint,
    color = 'black',
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
        <line
          x1={htmlStartPt.x}
          y1={htmlStartPt.y}
          x2={htmlEndPt.x}
          y2={htmlEndPt.y}
          stroke={color}
        />
      </svg>
    </Html>
  );
}

export default SelectionLine;
