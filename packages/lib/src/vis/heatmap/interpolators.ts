import { hsl } from 'd3-color';
import {
  interpolateCool,
  interpolateMagma,
  interpolateInferno,
  interpolatePlasma,
  interpolateViridis,
  interpolateBrBG,
  interpolatePRGn,
  interpolatePiYG,
  interpolatePuOr,
  interpolateRdBu,
  interpolateRdGy,
  interpolateRdYlBu,
  interpolateRdYlGn,
  interpolateSpectral,
  interpolateBlues,
  interpolateGreens,
  interpolateGreys,
  interpolateOranges,
  interpolatePurples,
  interpolateReds,
  interpolateWarm,
  interpolateBuGn,
  interpolateBuPu,
  interpolateGnBu,
  interpolateOrRd,
  interpolatePuBuGn,
  interpolatePuBu,
  interpolatePuRd,
  interpolateRdPu,
  interpolateYlGnBu,
  interpolateYlGn,
  interpolateYlOrBr,
  interpolateYlOrRd,
  interpolateRainbow,
  interpolateSinebow,
  interpolateCividis,
  interpolateTurbo,
} from 'd3-scale-chromatic';

import type { D3Interpolator } from './models';

function interpolateHsl(t: number): string {
  return hsl(t * 360, 1, 0.5).formatRgb();
}

function reverseInterpolator(interpolator: D3Interpolator) {
  return (t: number) => interpolator(1 - t);
}

export const INTERPOLATORS = {
  // Single-hue
  // Reverted to be consistent with Viridis/Inferno that go from dark to bright
  Blues: reverseInterpolator(interpolateBlues),
  Greens: reverseInterpolator(interpolateGreens),
  Greys: reverseInterpolator(interpolateGreys),
  Oranges: reverseInterpolator(interpolateOranges),
  Purples: reverseInterpolator(interpolatePurples),
  Reds: reverseInterpolator(interpolateReds),

  // Multi-hue
  Turbo: interpolateTurbo,
  Viridis: interpolateViridis,
  Inferno: interpolateInferno,
  Magma: interpolateMagma,
  Plasma: interpolatePlasma,
  Cividis: interpolateCividis,
  Warm: interpolateWarm,
  Cool: interpolateCool,
  BuGn: interpolateBuGn,
  BuPu: interpolateBuPu,
  GnBu: interpolateGnBu,
  OrRd: interpolateOrRd,
  PuBuGn: interpolatePuBuGn,
  PuBu: interpolatePuBu,
  PuRd: interpolatePuRd,
  RdPu: interpolateRdPu,
  YlGnBu: interpolateYlGnBu,
  YlGn: interpolateYlGn,
  YlOrBr: interpolateYlOrBr,
  YlOrRd: interpolateYlOrRd,

  // Cyclical
  Rainbow: interpolateRainbow,
  Sinebow: interpolateSinebow,
  HSL: interpolateHsl,

  // Diverging
  BrBG: interpolateBrBG,
  PRGn: interpolatePRGn,
  PiYG: interpolatePiYG,
  PuOr: interpolatePuOr,
  RdBu: interpolateRdBu,
  RdGy: interpolateRdGy,
  RdYlBu: interpolateRdYlBu,
  RdYlGn: interpolateRdYlGn,
  Spectral: interpolateSpectral,
};
