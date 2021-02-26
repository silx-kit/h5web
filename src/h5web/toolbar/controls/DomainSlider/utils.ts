import type { CustomDomain, Domain } from '../../../vis-packs/core/models';

export function getSliderDomain(
  dataDomain: Domain,
  customDomain: CustomDomain
): Domain {
  return [customDomain[0] ?? dataDomain[0], customDomain[1] ?? dataDomain[1]];
}
