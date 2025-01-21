import { type SVGProps } from 'react';

import Box from '../box';
import { type Rect } from '../models';

interface Props extends SVGProps<SVGPathElement> {
  coords: Rect;
  strokePosition?: 'inside' | 'outside'; // no effect without `stroke` prop; assumes `strokeWidth` of 1 unless specified explicitely as prop (CSS ignored)
  strokeWidth?: number; // forbid string
}

function SvgRect(props: Props) {
  const { coords, strokePosition, ...svgProps } = props;

  const { stroke, strokeWidth = 1 } = svgProps;

  // Shrink/grow rectangle to simulate positioning stroke inside/outside
  // https://stackoverflow.com/questions/7241393/can-you-control-how-an-svgs-stroke-width-is-drawn
  const offset =
    stroke && strokePosition
      ? strokeWidth * (strokePosition === 'outside' ? 1 : -1)
      : 0;

  const { min, max } = Box.fromPoints(...coords).expandBySize(offset, offset);

  return (
    <path
      d={`M ${min.x},${min.y} H ${max.x} V ${max.y} H ${min.x} z`}
      {...svgProps}
    />
  );
}

export type { Props as SvgRectProps };
export default SvgRect;
