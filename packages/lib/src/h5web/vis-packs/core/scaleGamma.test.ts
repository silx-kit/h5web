import { scaleGamma } from './scaleGamma';

describe('scaleGamma', () => {
  it('should initialize gamma scale', () => {
    const scale = scaleGamma({
      domain: [-10, 10],
      range: [0, 5],
      exponent: 2,
    });

    expect(scale.domain()).toEqual([-10, 10]);
    expect(scale.range()).toEqual([0, 5]);
    expect(scale.exponent()).toEqual(2);
  });

  it('should initialize gamma scale with default properties', () => {
    const scale = scaleGamma();

    expect(scale.domain()).toEqual([0, 1]);
    expect(scale.range()).toEqual([0, 1]);
    expect(scale.exponent()).toEqual(1);
  });

  it('should scale accordingly', () => {
    const scale = scaleGamma({
      domain: [40, 50],
      range: [0, 10],
      exponent: 2,
    });
    expect(scale(40)).toEqual(0);
    expect(scale(50)).toEqual(10);
    expect(scale(42)).toBeCloseTo(0.4);
  });

  it('should support changing the domain', () => {
    const scale = scaleGamma({
      domain: [0, 1],
      range: [0, 10],
      exponent: 2,
    });

    scale.domain([40, 50]);
    expect(scale.domain()).toEqual([40, 50]);
    expect(scale(40)).toEqual(0);
    expect(scale(50)).toEqual(10);
    expect(scale(42)).toBeCloseTo(0.4);
  });

  it('should support changing the range', () => {
    const scale = scaleGamma({
      domain: [10, 20],
      range: [0, 10],
      exponent: 2,
    });

    scale.range([-5, 5]);
    expect(scale.range()).toEqual([-5, 5]);
    expect(scale(10)).toEqual(-5);
    expect(scale(20)).toEqual(5);
    expect(scale(16)).toBeCloseTo(-1.4);
  });

  it('should support changing the exponent', () => {
    const scale = scaleGamma({
      domain: [10, 20],
      range: [-5, 5],
      exponent: 2,
    });

    scale.exponent(4);
    expect(scale.exponent()).toEqual(4);
    expect(scale(10)).toEqual(-5);
    expect(scale(20)).toEqual(5);
    expect(scale(18)).toBeCloseTo(-0.904);
  });

  it('should support changing to a rounding range', () => {
    const scale = scaleGamma({
      domain: [10, 20],
      range: [0, 1],
      exponent: 4,
    });

    scale.rangeRound([-5, 5]);
    expect(scale.range()).toEqual([-5, 5]);
    expect(scale(10)).toEqual(-5);
    expect(scale(20)).toEqual(5);
    expect(scale(18)).toEqual(-1);
  });

  it('should invert accordingly', () => {
    const scale = scaleGamma({
      domain: [40, 50],
      range: [0, 10],
      exponent: 2,
    });
    expect(scale.invert(0)).toEqual(40);
    expect(scale.invert(10)).toEqual(50);
    expect(scale.invert(0.4)).toEqual(42);
  });

  it('should clamp', () => {
    const scale = scaleGamma({
      domain: [0, 1],
      range: [0, 10],
      exponent: 2,
      clamp: true,
    });
    expect(scale(5)).toEqual(10);
  });

  it('should extend to a nice domain', () => {
    const scale = scaleGamma({
      domain: [0.58, 5.98],
      range: [0, 10],
      exponent: 2,
    });

    scale.nice();
    expect(scale.domain()).toEqual([0.5, 6]);
  });

  it('should return nice ticks values', () => {
    const scale = scaleGamma({
      range: [0, 10],
      exponent: 2,
    });

    scale.domain([-5.5, 5]);
    expect(scale.ticks(5)).toEqual([-4, -2, 0, 2, 4]);
  });

  it('should return tick format', () => {
    const scale = scaleGamma({
      domain: [0, 1],
      range: [0, 10],
      exponent: 2,
    });
    let formatter = scale.tickFormat(5);
    // Ticks are rounded to the first decimal
    expect(formatter(-3.4)).toEqual('−3.4');
    expect(formatter(2.856)).toEqual('2.9');

    scale.domain([-5.5, 5]);
    formatter = scale.tickFormat(5);
    // Ticks are rounded to the nearest integer
    expect(formatter(-3.4)).toEqual('−3');
    expect(formatter(2.856)).toEqual('3');
  });
});
