import type { Domain } from '@h5web/shared';

import type { ColorMap } from '../heatmap/models';
import type { VisScaleType } from '../models';

export interface ColorMapProps {
  domain: Domain;
  scaleType: VisScaleType;
  colorMap: ColorMap;
  invertColorMap?: boolean;
}
