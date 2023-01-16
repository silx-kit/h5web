import type { SVGProps } from 'react';

import type { Rect } from '../models';

interface Props extends SVGProps<SVGRectElement> {
  coords: Rect;
  strokeWidth?: number; // forbid string
  strokePosition?: 'inside' | 'outside';
}

function SvgRect(props: Props) {
  const { coords, strokePosition, ...svgProps } = props;

  const [start, end] = coords;
  const { stroke, strokeWidth = 1 } = svgProps;

  // Shrink/grow rectangle to simulate positioning stroke inside/outside
  // https://stackoverflow.com/questions/7241393/can-you-control-how-an-svgs-stroke-width-is-drawn
  const offset =
    stroke && strokePosition
      ? (strokeWidth / 2) * (strokePosition === 'inside' ? 1 : -1)
      : 0;

  return (
    <rect
      x={Math.min(start.x, end.x) + offset}
      y={Math.min(start.y, end.y) + offset}
      width={Math.abs(end.x - start.x) - offset * 2}
      height={Math.abs(end.y - start.y) - offset * 2}
      {...svgProps}
    />
  );
}

export type { Props as SvgRectProps };
export default SvgRect;
