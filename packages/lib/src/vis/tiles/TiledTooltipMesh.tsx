import { formatTooltipVal } from '@h5web/shared';

import type { Size } from '../models';
import TooltipMesh from '../shared/TooltipMesh';
import { useTooltipStore } from './store';

interface Props {
  size: Size;
}

function TiledTooltipMesh(props: Props) {
  const { size } = props;
  const val = useTooltipStore((state) => state.val);

  return (
    <TooltipMesh
      size={size}
      renderTooltip={() => {
        if (!val) {
          return undefined;
        }

        const { x, y, v } = val;
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {`x=${formatTooltipVal(x)}, y=${formatTooltipVal(y)}`}
            <strong>{formatTooltipVal(v)}</strong>
          </div>
        );
      }}
    />
  );
}

export default TiledTooltipMesh;
