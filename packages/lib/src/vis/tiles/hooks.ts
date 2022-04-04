import type { Domain } from '@h5web/shared';
import { scaleLinear } from '@visx/scale';

import { useVisibleDomains } from '../hooks';
import type { Size } from '../models';
import { useAxisSystemContext } from '../shared/AxisSystemContext';

export function useScaledVisibleDomains(size: Size): {
  xVisibleDomain: Domain;
  yVisibleDomain: Domain;
} {
  const { width, height } = size;
  const { xVisibleDomain, yVisibleDomain } = useVisibleDomains();
  const { abscissaConfig, ordinateConfig } = useAxisSystemContext();

  const xScale = scaleLinear({
    domain: abscissaConfig.flip
      ? abscissaConfig.visDomain.reverse()
      : abscissaConfig.visDomain,
    range: [0, width],
    clamp: true,
  });

  const yScale = scaleLinear({
    domain: ordinateConfig.flip
      ? ordinateConfig.visDomain.reverse()
      : ordinateConfig.visDomain,
    range: [0, height],
    clamp: true,
  });

  return {
    xVisibleDomain: xVisibleDomain.map(xScale) as Domain,
    yVisibleDomain: yVisibleDomain.map(yScale) as Domain,
  };
}
