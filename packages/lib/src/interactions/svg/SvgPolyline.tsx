import type { SVGProps } from 'react';

import type { Points } from '../models';

export interface SvgPolylineProps extends SVGProps<SVGPolylineElement> {
  coords: Points;
}

function SvgPolyline(props: SvgPolylineProps) {
  const { coords, fill = 'none', ...svgProps } = props;
  const pts = coords.map((c) => `${c.x},${c.y}`).join(' ');

  return <polyline points={pts} fill={fill} {...svgProps} />;
}

export default SvgPolyline;
