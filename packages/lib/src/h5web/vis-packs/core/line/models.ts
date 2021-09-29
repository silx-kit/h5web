import circleURL from './sprites/circle.png';
import crossURL from './sprites/cross.png';
import squareURL from './sprites/square.png';
import capURL from './sprites/cap.png';

export enum CurveType {
  LineOnly = 'OnlyLine',
  GlyphsOnly = 'OnlyGlyphs',
  LineAndGlyphs = 'LineAndGlyphs',
}

export const GLYPH_URLS = {
  Circle: circleURL,
  Cross: crossURL,
  Square: squareURL,
  Cap: capURL,
};

export interface TooltipData {
  abscissa: number;
  xi: number;
  x: number;
}
