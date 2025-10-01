import { type IgnoreValue, type NumArray } from '@h5web/shared/vis-models';
import { useMemo } from 'react';

import { useUpdateGeometry } from '../hooks';
import { useVisCanvasContext } from '../shared/VisCanvasProvider';
import ErrorBarsGeometry from './errorBarsGeometry';
import ErrorCapsGeometry from './errorCapsGeometry';
import GlyphMaterial from './GlyphMaterial';
import { GlyphType } from './models';

interface Props {
  abscissas: NumArray;
  ordinates: NumArray;
  errors: NumArray;
  color: string;
  visible?: boolean;
  ignoreValue?: IgnoreValue;
}

function ErrorBars(props: Props) {
  const {
    abscissas,
    ordinates,
    errors,
    color,
    visible = false,
    ignoreValue,
  } = props;
  const { abscissaScale, ordinateScale } = useVisCanvasContext();

  const params = useMemo(
    () => ({
      abscissas,
      ordinates,
      errors,
      abscissaScale,
      ordinateScale,
      ignoreValue,
    }),
    [abscissaScale, abscissas, errors, ignoreValue, ordinateScale, ordinates],
  );

  const barsGeometry = useMemo(() => new ErrorBarsGeometry(params), [params]);
  useUpdateGeometry(barsGeometry, { skipUpdates: !visible });

  const capsGeometry = useMemo(() => new ErrorCapsGeometry(params), [params]);
  useUpdateGeometry(capsGeometry, { skipUpdates: !visible });

  return (
    <>
      <lineSegments geometry={barsGeometry} visible={visible}>
        <lineBasicMaterial color={color} />
      </lineSegments>
      <points geometry={capsGeometry} visible={visible}>
        <GlyphMaterial glyphType={GlyphType.Cap} color={color} size={9} />
      </points>
    </>
  );
}

export type { Props as ErrorBarsProps };
export default ErrorBars;
