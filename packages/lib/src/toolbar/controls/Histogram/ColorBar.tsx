import { type SVGProps } from 'react';

import { type ColorMap } from '../../../vis/heatmap/models';
import { getInterpolator, GRADIENT_RANGE } from '../../../vis/heatmap/utils';

interface Props
  extends Required<
    Pick<SVGProps<SVGRectElement>, 'x' | 'y' | 'width' | 'height'>
  > {
  colorMap: ColorMap;
  invertColorMap?: boolean;
}

function ColorBar(props: Props) {
  const { colorMap, invertColorMap, ...rectProps } = props;
  const interpolator = getInterpolator(colorMap, !!invertColorMap);

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
