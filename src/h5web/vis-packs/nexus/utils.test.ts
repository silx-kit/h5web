import {
  intType,
  makeDataset,
  makeGroup,
  makeStrAttr,
  stringType,
  makeIntAttr,
  makeSilxStyleAttr,
  makeScalarDataset,
} from '../../providers/mock/metadata-utils';
import { mockConsoleMethod } from '../../test-utils';
import { ScaleType } from '../core/models';
import { findSignalDataset, getDatasetLabel, getSilxStyle } from './utils';

describe('findSignalDataset', () => {
  it("should return dataset named 'signal'", () => {
    const dataset = makeDataset('dataset', intType, [1]);
    const group = makeGroup('group', [dataset], {
      attributes: [makeStrAttr('signal', 'dataset')],
    });

    expect(findSignalDataset(group)).toBe(dataset);
  });

  it("should throw if group doesn't have 'signal' attribute", () => {
    const group = makeGroup('group');
    expect(() => findSignalDataset(group)).toThrow(/'signal' attribute$/);
  });

  it("should throw if group has 'signal' attribute with wrong type", () => {
    const group = makeGroup('group', [], {
      attributes: [makeIntAttr('signal', 42)],
    });

    expect(() => findSignalDataset(group)).toThrow(/to be a string/);
  });

  it("should throw if signal entity doesn't exist", () => {
    const group = makeGroup('group', [], {
      attributes: [makeStrAttr('signal', 'foo')],
    });

    expect(() => findSignalDataset(group)).toThrow(/to exist/);
  });

  it('should throw if signal entity is not a dataset', () => {
    const group = makeGroup('group', [makeGroup('foo')], {
      attributes: [makeStrAttr('signal', 'foo')],
    });

    expect(() => findSignalDataset(group)).toThrow(/to be a dataset/);
  });

  it('should throw if signal dataset has non-array shape', () => {
    const dataset = makeScalarDataset('dataset', intType);
    const group = makeGroup('group', [dataset], {
      attributes: [makeStrAttr('signal', 'dataset')],
    });

    expect(() => findSignalDataset(group)).toThrow(/to have array shape/);
  });

  it('should throw if signal dataset has non-numeric type', () => {
    const dataset = makeDataset('dataset', stringType, [1]);
    const group = makeGroup('group', [dataset], {
      attributes: [makeStrAttr('signal', 'dataset')],
    });

    expect(() => findSignalDataset(group)).toThrow(
      /to have numeric or complex type/
    );
  });
});

describe('getDatasetLabel', () => {
  it('should return value of `long_name` attribute in priority if available', () => {
    const dataset = makeScalarDataset('foo', intType, {
      attributes: [
        makeStrAttr('long_name', 'Foobar'),
        makeStrAttr('units', 'nm'),
      ],
    });

    expect(getDatasetLabel(dataset)).toBe('Foobar');
  });

  it('should combine dataset name and value of `units` attribute if available', () => {
    const dataset = makeScalarDataset('foo', intType, {
      attributes: [makeStrAttr('units', 'nm')],
    });

    expect(getDatasetLabel(dataset)).toBe('foo (nm)');
  });

  it('should fall back to dataset name when other attributes are absent or not string', () => {
    const dataset1 = makeScalarDataset('foo', intType);
    const dataset2 = makeScalarDataset('foo', intType, {
      attributes: [makeIntAttr('long_name', 42), makeIntAttr('units', 42)],
    });

    expect(getDatasetLabel(dataset1)).toBe('foo');
    expect(getDatasetLabel(dataset2)).toBe('foo');
  });
});

describe('getSilxStyle', () => {
  it('should parse `SILX_style` attribute', () => {
    const silxStyle = {
      signalScaleType: ScaleType.SymLog,
      axisScaleTypes: [ScaleType.Log],
    };

    const group = makeGroup('foo', [], {
      attributes: [makeSilxStyleAttr(silxStyle)],
    });

    expect(getSilxStyle(group)).toEqual(silxStyle);
  });

  it('should support single axis scale type', () => {
    const silxStyle = { axes_scale_type: ScaleType.Log };
    const group = makeGroup('foo', [], {
      attributes: [makeStrAttr('SILX_style', JSON.stringify(silxStyle))],
    });

    expect(getSilxStyle(group)).toEqual({
      axisScaleTypes: [ScaleType.Log],
    });
  });

  it('should ignore unknown `SILX_style` options and invalid values', () => {
    const silxStyle = {
      unknown: ScaleType.Log,
      signal_scale_type: 'invalid',
      axes_scale_type: [ScaleType.Linear, 'invalid'],
    };

    const group = makeGroup('foo', [], {
      attributes: [makeStrAttr('SILX_style', JSON.stringify(silxStyle))],
    });

    expect(getSilxStyle(group)).toEqual({
      signalScaleType: undefined,
      axisScaleTypes: undefined,
    });
  });
});

it('should return empty object and warn to console if `SILX_style` attribute value is not valid, stringified JSON', () => {
  const warnSpy = mockConsoleMethod('warn');

  const group = makeGroup('foo', [], {
    attributes: [makeStrAttr('SILX_style', '{')],
  });

  expect(getSilxStyle(group)).toEqual({});
  expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/Malformed/));
});

it("should return empty object if `SILX_style` attribute doesn't exist, is empty or is not string", () => {
  const group1 = makeGroup('foo');
  const group2 = makeGroup('foo', [], {
    attributes: [makeStrAttr('SILX_style', '')],
  });
  const group3 = makeGroup('foo', [], {
    attributes: [makeIntAttr('SILX_style', 42)],
  });

  expect(getSilxStyle(group1)).toEqual({});
  expect(getSilxStyle(group2)).toEqual({});
  expect(getSilxStyle(group3)).toEqual({});
});
