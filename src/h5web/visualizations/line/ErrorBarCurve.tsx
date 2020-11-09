import React, { ReactElement } from 'react';
import { LineSegments } from 'react-three-fiber/components';
import { useDataGeometry } from './hooks';

const DEFAULT_COLOR = '#1b998b';

interface Props {
  abscissas: number[];
  ordinates: number[];
  errors: number[];
  color?: string;
}

function ErrorBarCurve(props: Props): ReactElement {
  const { abscissas, ordinates, errors, color = DEFAULT_COLOR } = props;

  const errorAbscissas = [];
  const errorOrdinates = [];
  for (const [index, x] of abscissas.entries()) {
    const y = ordinates[index];
    const yerr = errors[index];

    // Error bar segment: [x, y - yerr] to [x, y + yerr]
    errorAbscissas.push(x);
    errorOrdinates.push(y - yerr);
    errorAbscissas.push(x);
    errorOrdinates.push(y + yerr);
  }

  const errorGeometry = useDataGeometry(errorAbscissas, errorOrdinates);

  return (
    <LineSegments geometry={errorGeometry}>
      <lineBasicMaterial attach="material" color={color} linewidth={2} />
    </LineSegments>
  );
}

export default ErrorBarCurve;
