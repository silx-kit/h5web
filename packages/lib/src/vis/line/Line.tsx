import { type IgnoreValue, type NumArray } from '@h5web/shared/vis-models';
import { extend } from '@react-three/fiber';
import { type ComponentProps, useMemo } from 'react';
import { Line2 as ThreeLine2 } from 'three/addons/lines/Line2.js';
import {
  LineMaterial as ThreeLineMaterial,
  type LineMaterialParameters,
} from 'three/addons/lines/LineMaterial.js';

import { useUpdateGeometry } from '../hooks';
import { useVisCanvasContext } from '../shared/VisCanvasProvider';
import { hasR3FEventHandlers } from '../utils';
import LineConstantGeometry from './lineConstantGeometry';
import LineGeometry from './lineGeometry';
import { Interpolation } from './models';

const Line2 = extend(ThreeLine2);
const LineMaterial = extend(ThreeLineMaterial);

interface Props extends ComponentProps<typeof Line2> {
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
    <Line2 geometry={geometry} visible={visible} {...lineProps}>
      <LineMaterial color={color} linewidth={width} {...materialProps} />
    </Line2>
  );
}

export type { Props as LineProps };
export default Line;
