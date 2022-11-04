import type { ReactElement } from 'react';

import type { Size } from '../models';
import TooltipMesh from '../shared/TooltipMesh';
import { useTooltipStore } from './store';

interface Props {
  size?: Size;
  renderTooltip: (x: number, y: number, v: number) => ReactElement | undefined;
}

function TiledTooltipMesh(props: Props) {
  const { size, renderTooltip } = props;

  const val = useTooltipStore((state) => state.val);

  return (
    <TooltipMesh
      size={size}
      renderTooltip={() => {
        if (!val) {
          return undefined;
        }

        const { x, y, v } = val;
        return renderTooltip(x, y, v);
      }}
    />
  );
}

export default TiledTooltipMesh;
