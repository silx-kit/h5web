import { type IgnoreValue, type NumArray } from '@h5web/shared/vis-models';
import {
  extend,
  type LineBasicMaterialProps,
  type Object3DNode,
} from '@react-three/fiber';
import { useMemo } from 'react';
import { Line as Line_ } from 'three';

import { useUpdateGeometry } from '../hooks';
import { useVisCanvasContext } from '../shared/VisCanvasProvider';
import { hasR3FEventHandlers } from '../utils';
import LineConstantGeometry from './lineConstantGeometry';
import LineGeometry from './lineGeometry';
import { Interpolation } from './models';

// Alias Three's `Line` to `Line_` to avoid conflict with SVG `line` in JSX
// https://docs.pmnd.rs/react-three-fiber/tutorials/typescript#extending-threeelements
extend({ Line_ });
declare module '@react-three/fiber' {
  interface ThreeElements {
    line_: Object3DNode<Line_, typeof Line_>;
  }
}

interface Props extends Object3DNode<Line_, typeof Line_> {
  abscissas: NumArray;
  ordinates: NumArray;
  color: string;
  materialProps?: LineBasicMaterialProps;
  visible?: boolean;
  ignoreValue?: IgnoreValue;
  interpolation?: Interpolation;
}

function Line(props: Props) {
  const {
    abscissas,
    ordinates,
    color,
    materialProps = {},
    visible = true,
    ignoreValue,
    interpolation,
    ...lineProps
  } = props;

  const { abscissaScale, ordinateScale } = useVisCanvasContext();

  const Geometry =
    interpolation === Interpolation.Constant
      ? LineConstantGeometry
      : LineGeometry;

  const geometry = useMemo(
    () =>
      new Geometry({
        abscissas,
        ordinates,
        abscissaScale,
        ordinateScale,
        ignoreValue,
      }),
    [Geometry, abscissaScale, abscissas, ignoreValue, ordinateScale, ordinates],
  );

  useUpdateGeometry(geometry, {
    skipUpdates: !visible,
    isInteractive: hasR3FEventHandlers(lineProps),
  });

  return (
    <line_ geometry={geometry} visible={visible} {...lineProps}>
      <lineBasicMaterial color={color} {...materialProps} />
    </line_>
  );
}

export type { Props as LineProps };
export default Line;
