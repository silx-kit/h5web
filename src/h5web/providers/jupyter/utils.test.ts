import type { JupyterComplexValue } from './models';
import { parseComplex } from './utils';

describe('parseComplex', () => {
  it('should parse scalar complex', () => {
    expect(parseComplex('(1+5j)')).toEqual([1, 5]);
  });

  it('should parse complex array', () => {
    const jupyterComplexArray: JupyterComplexValue[][] = [
      ['0j', '1j'],
      ['(1+0j)', '(1-2j)'],
    ];
    expect(parseComplex(jupyterComplexArray)).toEqual([
      [
        [0, 0],
        [0, 1],
      ],
      [
        [1, 0],
        [1, -2],
      ],
    ]);
  });
});
