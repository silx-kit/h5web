import { type SVGProps } from 'react';

import { type Rect } from '../models';

interface Props extends SVGProps<SVGLineElement> {
  coords: Rect;
}

function SvgLine(props: Props) {
  const { coords, ...svgProps } = props;
  const [start, end] = coords;

  return <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} {...svgProps} />;
}

export type { Props as SvgLineProps };
export default SvgLine;
