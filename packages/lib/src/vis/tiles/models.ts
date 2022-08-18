import type { Domain } from '@h5web/shared';
import type { NdArray } from 'ndarray';

import type { ColorMap, TextureSafeTypedArray } from '../heatmap/models';
import type { VisScaleType } from '../models';

export interface ColorMapProps {
  domain: Domain;
  scaleType: VisScaleType;
  colorMap: ColorMap;
  invertColorMap?: boolean;
}

export type TileArray = NdArray<TextureSafeTypedArray | Uint16Array>; // uint16 values are treated as half floats
