import { type Domain } from '@h5web/shared/vis-models';
import { type NdArray } from 'ndarray';

import {
  type D3Interpolator,
  type TextureSafeTypedArray,
} from '../heatmap/models';
import { type VisScaleType } from '../models';

export interface ColorMapProps {
  domain: Domain;
  scaleType: VisScaleType;
  interpolator: D3Interpolator;
}

export type TileArray = NdArray<TextureSafeTypedArray>;
