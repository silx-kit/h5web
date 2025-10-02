import { type IgnoreValue, type NumArray } from '@h5web/shared/vis-models';
import { extend, type Object3DNode } from '@react-three/fiber';
import { useMemo } from 'react';
import { Line2 } from 'three/addons/lines/Line2.js';
import {
  LineMaterial,
  type LineMaterialParameters,
} from 'three/addons/lines/LineMaterial.js';

import { useUpdateGeometry } from '../hooks';
import { useVisCanvasContext } from '../shared/VisCanvasProvider';
import { hasR3FEventHandlers } from '../utils';
import LineConstantGeometry from './lineConstantGeometry';
import LineGeometry from './lineGeometry';
import { Interpolation } from './models';

extend({ Line2, LineMaterial });
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
  width?: number;
  interpolation?: Interpolation;
  materialProps?: LineMaterialParameters;
  visible?: boolean;
  ignoreValue?: IgnoreValue;
}

function Line(props: Props) {
  const {
    abscissas,
    ordinates,
    color,
    interpolation,
    width = 1,
    materialProps = {},
    visible = true,
    ignoreValue,
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
    <line2 geometry={geometry} visible={visible} {...lineProps}>
      <lineMaterial color={color} linewidth={width} {...materialProps} />
    </line2>
  );
}

export type { Props as LineProps };
export default Line;
