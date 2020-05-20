import circleURL from './sprites/circle.png';
import crossURL from './sprites/cross.png';
import squareURL from './sprites/square.png';

export enum CurveType {
  OnlyLine = 'OnlyLine',
  OnlyGlyphs = 'OnlyGlyphs',
  LineAndGlyphs = 'LineAndGlyphs',
}

export const GLYPH_URLS = {
  Circle: circleURL,
  Cross: crossURL,
  Square: squareURL,
};
