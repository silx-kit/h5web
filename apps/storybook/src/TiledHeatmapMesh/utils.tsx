import { formatTooltipVal } from '@h5web/shared/vis-utils';

export function renderTooltip(x: number, y: number, v: number) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {`x=${formatTooltipVal(x)}, y=${formatTooltipVal(y)}`}
      <strong>{formatTooltipVal(v)}</strong>
    </div>
  );
}
