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

const MOST_USED = {
  Viridis: interpolateViridis,
  Inferno: interpolateInferno,
  Greys: interpolateGreys,
  RdBu: interpolateRdBu,
  Rainbow: interpolateRainbow,
};

const SINGLE_HUE = {
  Blues: interpolateBlues,
  Greens: interpolateGreens,
  Greys: interpolateGreys,
  Oranges: interpolateOranges,
  Purples: interpolatePurples,
  Reds: interpolateReds,
};

const MULTI_HUE = {
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
};

const CYCLICAL = {
  Rainbow: interpolateRainbow,
  Sinebow: interpolateSinebow,
};

const DIVERGING = {
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

export const INTERPOLATORS = {
  ...SINGLE_HUE,
  ...MULTI_HUE,
  ...CYCLICAL,
  ...DIVERGING,
};

export const INTERPOLATOR_GROUPS = {
  Common: MOST_USED,
  'Single hue': SINGLE_HUE,
  'Multi hue': MULTI_HUE,
  Cyclical: CYCLICAL,
  Diverging: DIVERGING,
};
