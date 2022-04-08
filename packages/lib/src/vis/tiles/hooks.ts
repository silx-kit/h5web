import { ScaleType } from '@h5web/shared';
import type { Domain } from '@h5web/shared';

import { useVisibleDomains } from '../hooks';
import type { Size } from '../models';
import { useAxisSystemContext } from '../shared/AxisSystemContext';
import { createAxisScale } from '../utils';

export function useScaledVisibleDomains(size: Size): {
  xVisibleDomain: Domain;
  yVisibleDomain: Domain;
} {
  const { width, height } = size;
  const { xVisibleDomain, yVisibleDomain } = useVisibleDomains();
  const { abscissaConfig, ordinateConfig } = useAxisSystemContext();

  const xScale = createAxisScale(abscissaConfig.scaleType ?? ScaleType.Linear, {
    domain: abscissaConfig.visDomain,
    range: [0, width],
    clamp: true,
  });

  const yScale = createAxisScale(ordinateConfig.scaleType ?? ScaleType.Linear, {
    domain: ordinateConfig.visDomain,
    range: [0, height],
    clamp: true,
  });

  return {
    xVisibleDomain: xVisibleDomain.map(xScale) as Domain,
    yVisibleDomain: yVisibleDomain.map(yScale) as Domain,
  };
}
