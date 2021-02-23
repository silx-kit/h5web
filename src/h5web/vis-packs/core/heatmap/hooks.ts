import { useMemo } from 'react';
import type { CustomDomain, Domain } from '../models';

export function useVisDomain(
  dataDomain: Domain,
  customDomain: CustomDomain
): Domain {
  const min = customDomain[0] ?? dataDomain[0];
  const max = customDomain[1] ?? dataDomain[1];

  return useMemo(() => [min, max], [min, max]);
}
