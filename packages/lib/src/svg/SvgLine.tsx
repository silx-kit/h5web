import type { SVGProps } from 'react';

import type { Rect } from '../interactions/models';
import { useHtmlCoords } from '../vis/hooks';
import SvgElement from './SvgElement';

interface Props extends SVGProps<SVGLineElement> {
  coords: Rect;
}

function SvgLine(props: Props) {
  const { coords, stroke = 'black', ...svgProps } = props;

  const [htmlStart, htmlEnd] = useHtmlCoords(...coords);
  const { x: x1, y: y1 } = htmlStart;
  const { x: x2, y: y2 } = htmlEnd;

  return (
    <SvgElement>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} {...svgProps} />
    </SvgElement>
  );
}

export type { Props as SvgLineProps };
export default SvgLine;
