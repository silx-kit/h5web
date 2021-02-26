import { useEffect, useState } from 'react';
import type { Domain } from '../../../../packages/lib';
import type { CustomDomain } from '../../../vis-packs/core/models';
import { getSliderDomain } from './utils';

export function useAppliedDomain(
  dataDomain: Domain,
  customDomain: CustomDomain
) {
  const state = useState(getSliderDomain(dataDomain, customDomain));
  const [, setAppliedDomain] = state;

  useEffect(() => {
    setAppliedDomain(getSliderDomain(dataDomain, customDomain));
  }, [customDomain, dataDomain, setAppliedDomain]);

  return state;
}
