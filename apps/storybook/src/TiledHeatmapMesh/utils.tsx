import { formatTooltipVal } from '@h5web/shared';

import type { TileParams } from './models';

export function renderTooltip(x: number, y: number, v: number) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {`x=${formatTooltipVal(x)}, y=${formatTooltipVal(y)}`}
      <strong>{formatTooltipVal(v)}</strong>
    </div>
  );
}

export function areTilesEqual(a: TileParams, b: TileParams) {
  return a.layer === b.layer && a.offset.equals(b.offset);
}
