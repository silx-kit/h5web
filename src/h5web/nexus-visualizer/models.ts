import { Vis } from '../dataset-visualizer/models';

export enum NXDataAttribute {
  Signal = 'signal',
  Interpretation = 'interpretation',
}

export enum NXDataInterpretation {
  Spectrum = 'spectrum',
  Image = 'image',
}

export const INTERPRETATION_VIS: Record<NXDataInterpretation, Vis> = {
  [NXDataInterpretation.Spectrum]: Vis.Line,
  [NXDataInterpretation.Image]: Vis.Heatmap,
};
