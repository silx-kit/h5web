import type { HsdsLink, HsdsExternalLink } from './models';

export function isHsdsExternalLink(link: HsdsLink): link is HsdsExternalLink {
  return 'h5domain' in link;
}
