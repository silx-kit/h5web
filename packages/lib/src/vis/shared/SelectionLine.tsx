import type { Color, Object3DNode } from '@react-three/fiber';
import { extend, useThree } from '@react-three/fiber';
import { useLayoutEffect, useState } from 'react';
import type { Vector2 } from 'three';
import { BufferGeometry, Line } from 'three';

import { useAxisSystemContext } from './AxisSystemContext';

extend({ Line_: Line });

// https://github.com/pmndrs/react-three-fiber/issues/1152
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      line_: Object3DNode<Line, typeof Line>;
    }
  }
}

interface Props {
  startPoint: Vector2;
  endPoint: Vector2;
  color?: Color;
}

function SelectionLine(props: Props) {
  const {
    startPoint: dataStartPoint,
    endPoint: dataEndPoint,
    color = 'black',
  } = props;

  const { dataToWorld } = useAxisSystemContext();
  const startPoint = dataToWorld(dataStartPoint);
  const endPoint = dataToWorld(dataEndPoint);

  const [dataGeometry] = useState(() => new BufferGeometry());
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    dataGeometry.setFromPoints([startPoint, endPoint]);
    dataGeometry.computeBoundingSphere();
    invalidate();
  }, [dataGeometry, endPoint, invalidate, startPoint]);

  return (
    <line_ geometry={dataGeometry}>
      <lineBasicMaterial color={color} />
    </line_>
  );
}

export default SelectionLine;
