import { type IgnoreValue, type NumArray } from '@h5web/shared/vis-models';
import { extend, type Object3DNode, useThree } from '@react-three/fiber';
import { Vector2 } from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry as R3FLineGeometry } from 'three/addons/lines/LineGeometry.js';

import { useGeometry } from '../hooks';
import { useVisCanvasContext } from '../shared/VisCanvasProvider';
import { hasR3FEventHandlers } from '../utils';
import LineGeometry from './lineGeometry';

extend({ Line2 });
declare module '@react-three/fiber' {
  interface ThreeElements {
    line2: Object3DNode<Line2, typeof Line2>;
    lineMaterial: Object3DNode<LineMaterial, typeof LineMaterial>;
  }
}

interface Props extends Object3DNode<Line2, typeof Line2> {
  abscissas: NumArray;
  ordinates: NumArray;
  color: string;
  lineWidth?: number;
  visible?: boolean;
  ignoreValue?: IgnoreValue;
}

function Line(props: Props) {
  const {
    abscissas,
    ordinates,
    color,
    lineWidth = 1,
    visible = true,
    ignoreValue,
    ...lineProps
  } = props;

  const { abscissaScale, ordinateScale } = useVisCanvasContext();
  const { size } = useThree();

  const geometry = useGeometry(
    LineGeometry,
    ordinates.length,
    {
      abscissas,
      ordinates,
      abscissaScale,
      ordinateScale,
      ignoreValue,
    },
    {
      skipUpdates: !visible,
      isInteractive: hasR3FEventHandlers(lineProps),
    },
  );

  // Create Line2 geometry from the same data
  const line2Geometry = new R3FLineGeometry();
  const positions = new Float32Array(geometry.getAttribute('position').array);
  line2Geometry.setPositions(positions);

  const line2Material = new LineMaterial({
    color: color,
    linewidth: lineWidth,
    resolution: new Vector2(size.width, size.height),
  });

  return (
    <>
      <line2
        geometry={line2Geometry}
        material={line2Material}
        visible={visible}
        {...lineProps}
      />
    </>
  );
}

export type { Props as LineProps };
export default Line;
