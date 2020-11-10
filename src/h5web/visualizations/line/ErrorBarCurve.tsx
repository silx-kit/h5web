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

  const capLength = 0.1 * (abscissas[1] - abscissas[0]);

  const errorAbscissas = [];
  const errorOrdinates = [];
  for (const [index, x] of abscissas.entries()) {
    const y = ordinates[index];
    const yerr = errors[index];

    if (yerr === 0) {
      continue;
    }

    // First segment: bottom cap
    errorAbscissas.push(x - capLength);
    errorOrdinates.push(y - yerr);
    errorAbscissas.push(x + capLength);
    errorOrdinates.push(y - yerr);

    // Second segment: error bar
    errorAbscissas.push(x);
    errorOrdinates.push(y - yerr);
    errorAbscissas.push(x);
    errorOrdinates.push(y + yerr);

    // Third segment: top cap
    errorAbscissas.push(x - capLength);
    errorOrdinates.push(y + yerr);
    errorAbscissas.push(x + capLength);
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
