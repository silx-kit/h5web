import { gammaScale } from './scales';

describe('gammaScale', () => {
  it('should have the properties set accordingly', () => {
    const scale = gammaScale({
      domain: [-0.5, 0.5],
      range: [0, 10],
      exponent: 2,
    });

    expect(scale.domain()).toEqual([-0.5, 0.5]);
    expect(scale.range()).toEqual([0, 10]);
    expect(scale.exponent()).toEqual(2);
  });

  it('should allow to change properties', () => {
    const scale = gammaScale({
      domain: [-10, 10],
      range: [0, 10],
      exponent: 2,
    });

    scale.domain([0, 5]);
    expect(scale.domain()).toEqual([0, 5]);

    expect(scale(10)).toEqual(10);
  });

  it('should scale accordingly', () => {
    const scale = gammaScale({ domain: [0, 1], range: [0, 10], exponent: 2 });

    expect(scale(0.5)).toEqual(2.5);
  });

  it('should invert accordingly', () => {
    const scale = gammaScale({ domain: [0, 1], range: [0, 10], exponent: 2 });

    expect(scale.invert(2.5)).toEqual(0.5);
  });
});
