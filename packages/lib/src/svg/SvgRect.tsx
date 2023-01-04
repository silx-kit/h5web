import type { SVGProps } from 'react';

import type { Rect3 } from '../interactions/models';
import { useHtmlCoords } from '../vis/hooks';
import SvgElement from './SvgElement';

interface Props extends SVGProps<SVGRectElement> {
  coords: Rect3;
}

function SvgRect(props: Props) {
  const { coords, fill = 'black', ...svgProps } = props;

  const [htmlStart, htmlEnd] = useHtmlCoords(...coords);
  const { x: x1, y: y1 } = htmlStart;
  const { x: x2, y: y2 } = htmlEnd;

  return (
    <SvgElement>
      <rect
        x={Math.min(x1, x2)}
        y={Math.min(y1, y2)}
        width={Math.abs(x2 - x1)}
        height={Math.abs(y2 - y1)}
        fill={fill}
        {...svgProps}
      />
    </SvgElement>
  );
}

export type { Props as SvgRectProps };
export default SvgRect;
