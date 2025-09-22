import { type IgnoreValue, type NumArray } from '@h5web/shared/vis-models';
import {
  extend,
  type LineBasicMaterialProps,
  type Object3DNode,
} from '@react-three/fiber';
import { Line as R3FLine } from 'three';

import { useGeometry } from '../hooks';
import { useVisCanvasContext } from '../shared/VisCanvasProvider';
import { hasR3FEventHandlers } from '../utils';
import LineGeometry from './lineGeometry';
import PieceWiseConstantLineGeometry from './piecewiseConstantLineGeometry';

// Alias Three's `Line` to `Line_` to avoid conflict with SVG `line` in JSX
// https://docs.pmnd.rs/react-three-fiber/tutorials/typescript#extending-threeelements
class Line_ extends R3FLine {}
extend({ Line_ });
declare module '@react-three/fiber' {
  interface ThreeElements {
    line_: Object3DNode<R3FLine, typeof R3FLine>;
  }
}

interface Props extends Object3DNode<R3FLine, typeof R3FLine> {
  abscissas: NumArray;
  ordinates: NumArray;
  color: string;
  materialProps?: LineBasicMaterialProps;
  visible?: boolean;
  ignoreValue?: IgnoreValue;
  piecewiseConstant?: boolean;
}

function Line(props: Props) {
  const {
    abscissas,
    ordinates,
    color,
    materialProps = {},
    visible = true,
    ignoreValue,
    piecewiseConstant,
    ...lineProps
  } = props;

  const { abscissaScale, ordinateScale } = useVisCanvasContext();

  const Geometry = piecewiseConstant
    ? PieceWiseConstantLineGeometry
    : LineGeometry;

  const geometry = useGeometry(
    Geometry,
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

  return (
    <line_ geometry={geometry} visible={visible} {...lineProps}>
      <lineBasicMaterial color={color} {...materialProps} />
    </line_>
  );
}

export type { Props as LineProps };
export default Line;
