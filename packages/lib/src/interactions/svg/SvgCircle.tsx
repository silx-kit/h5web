import { type SVGProps } from 'react';

import { type Rect } from '../models';

interface Props extends SVGProps<SVGCircleElement> {
  coords: Rect;
}

function SvgCircle(props: Props) {
  const { coords, ...svgProps } = props;

  const [start, end] = coords;
  const radius = end.distanceTo(start);

  return <circle cx={start.x} cy={start.y} r={radius} {...svgProps} />;
}

export { type Props as SvgCircleProps };
export default SvgCircle;
