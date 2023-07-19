import type { CustomDomain, Domain, Rect } from '@h5web/lib';
import { format } from 'd3-format';

export const formatCoord = format('.2f');
export const formatDomainValue = format('.3~f');

export function getTitleForSelection(selection: Rect | undefined) {
  if (!selection) {
    return 'No selection';
  }

  const [start, end] = selection;
  return `Selection from (${formatCoord(start.x)}, ${formatCoord(
    start.y,
  )}) to (${formatCoord(end.x)}, ${formatCoord(end.y)})`;
}

export function formatDomain(domain: Domain | CustomDomain) {
  return `[${domain
    .map((val) => (val === null ? 'null' : formatDomainValue(val)))
    .join(', ')}]`;
}
