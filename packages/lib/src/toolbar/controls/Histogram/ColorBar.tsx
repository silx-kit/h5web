import { type SVGProps } from 'react';

import { type D3Interpolator } from '../../../vis/heatmap/models';
import { GRADIENT_RANGE } from '../../../vis/heatmap/utils';

interface Props extends Required<
  Pick<SVGProps<SVGRectElement>, 'x' | 'y' | 'width' | 'height'>
> {
  interpolator: D3Interpolator;
}

function ColorBar(props: Props) {
  const { interpolator, ...rectProps } = props;

  return (
    <>
      <defs>
        <linearGradient id="ColorMapGradient">
          {GRADIENT_RANGE.map((v) => {
            return (
              <stop
                key={v}
                offset={`${v * 100}%`}
                stopColor={interpolator(v)}
              />
            );
          })}
        </linearGradient>
      </defs>
      <rect {...rectProps} fill="url(#ColorMapGradient)" />
    </>
  );
}

export default ColorBar;
