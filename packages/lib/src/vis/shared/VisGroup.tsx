import { ScaleType } from '@h5web/shared';
import type { PropsWithChildren } from 'react';

import { useAxisSystemContext } from './AxisSystemProvider';

interface Props {}

function VisGroup(props: PropsWithChildren<Props>) {
  const { children } = props;
  const { abscissaConfig, ordinateConfig, visSize } = useAxisSystemContext();
  const { width, height } = visSize;
  const { scaleType: abscissaScaleType = ScaleType.Linear } = abscissaConfig;
  const { scaleType: ordinateScaleType = ScaleType.Linear } = ordinateConfig;

  if (
    abscissaScaleType !== ScaleType.Linear ||
    ordinateScaleType !== ScaleType.Linear
  ) {
    throw new Error('VisGroup supports only linear axes');
  }

  const sx =
    ((abscissaConfig.flip ? -1 : 1) * width) /
    (abscissaConfig.visDomain[1] - abscissaConfig.visDomain[0]);
  const sy =
    ((ordinateConfig.flip ? -1 : 1) * height) /
    (ordinateConfig.visDomain[1] - ordinateConfig.visDomain[0]);
  const centerX =
    0.5 * (abscissaConfig.visDomain[0] + abscissaConfig.visDomain[1]);
  const centerY =
    0.5 * (ordinateConfig.visDomain[0] + ordinateConfig.visDomain[1]);

  return (
    <group position={[-centerX * sx, -centerY * sy, 0]} scale={[sx, sy, 1]}>
      {children}
    </group>
  );
}

export type { Props as VisGroupProps };
export default VisGroup;
