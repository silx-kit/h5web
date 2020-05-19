export enum Glyph {
  None = 'None',
  Square = 'Square',
  Circle = 'Circle',
  Cross = 'Cross',
}

export type SpriteGlyph = Exclude<Glyph, Glyph.None>;
