export enum CurveType {
  LineOnly = 'OnlyLine',
  GlyphsOnly = 'OnlyGlyphs',
  LineAndGlyphs = 'LineAndGlyphs',
}

export enum GlyphType {
  Circle = 'Circle',
  Cross = 'Cross',
  Square = 'Square',
  Cap = 'Cap',
}

export interface TooltipData {
  abscissa: number;
  xi: number;
  x: number;
}
