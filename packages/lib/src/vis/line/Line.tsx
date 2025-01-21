import { type NumArray } from '@h5web/shared/vis-models';
import { extend, type Object3DNode } from '@react-three/fiber';
import { Line as R3FLine } from 'three';

import { useGeometry } from '../hooks';
import { useVisCanvasContext } from '../shared/VisCanvasProvider';
import { hasR3FEventHandlers } from '../utils';
import LineGeometry from './lineGeometry';

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
  visible?: boolean;
  ignoreValue?: (val: number) => boolean;
}

function Line(props: Props) {
  const {
    abscissas,
    ordinates,
    color,
    visible = true,
    ignoreValue,
    ...lineProps
  } = props;

  const { abscissaScale, ordinateScale } = useVisCanvasContext();

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

  return (
    <line_ geometry={geometry} visible={visible} {...lineProps}>
      <lineBasicMaterial color={color} />
    </line_>
  );
}

export type { Props as LineProps };
export default Line;
