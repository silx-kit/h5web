import {
  intType,
  makeAttr,
  makeDataset,
  makeGroup,
  makeSimpleShape,
  makeStrAttr,
  scalarShape,
  stringType,
  makeNxAxesAttr,
  makeIntAttr,
  makeSilxStyleAttr,
} from '../../providers/mock/data-utils';
import { mockConsoleMethod } from '../../test-utils';
import { ScaleType } from '../shared/models';
import {
  findSignalDataset,
  getAttributeValue,
  getDatasetLabel,
  getNxAxes,
  getSilxStyle,
  isNxInterpretation,
} from './utils';

describe('NeXus utilities', () => {
  describe('getAttributeValue', () => {
    const group = makeGroup('group', [], {
      attributes: [
        makeStrAttr('signal', 'my_signal'),
        makeAttr('axes', makeSimpleShape([1]), stringType, ['X']),
      ],
    });

    it("should return an attribute's value", () => {
      expect(getAttributeValue(group, 'signal')).toBe('my_signal');
      expect(getAttributeValue(group, 'axes')).toEqual(['X']);
    });

    it("should return `undefined` if attribute doesn't exist", () => {
      expect(getAttributeValue(group, 'NX_class')).toBeUndefined();
    });
  });

  describe('findSignalDataset', () => {
    it("should return dataset named 'signal'", () => {
      const dataset = makeDataset('dataset', makeSimpleShape([1]), intType);
      const group = makeGroup('group', [dataset], {
        attributes: [makeStrAttr('signal', 'dataset')],
      });

      expect(findSignalDataset(group)).toBe(dataset);
    });

    it("should throw if group doesn't have 'signal' attribute", () => {
      const group = makeGroup('group');
      expect(() => findSignalDataset(group)).toThrow(/'signal' attribute$/u);
    });

    it("should throw if group has 'signal' attribute with wrong type", () => {
      const group = makeGroup('group', [], {
        attributes: [makeIntAttr('signal', 42)],
      });

      expect(() => findSignalDataset(group)).toThrow(/to be a string/u);
    });

    it("should throw if signal entity doesn't exist", () => {
      const group = makeGroup('group', [], {
        attributes: [makeStrAttr('signal', 'foo')],
      });

      expect(() => findSignalDataset(group)).toThrow(/to exist/u);
    });

    it('should throw if signal entity is not a dataset', () => {
      const group = makeGroup('group', [makeGroup('foo')], {
        attributes: [makeStrAttr('signal', 'foo')],
      });

      expect(() => findSignalDataset(group)).toThrow(/to be a dataset/u);
    });

    it('should throw if signal dataset has non-simple shape', () => {
      const dataset = makeDataset('dataset', scalarShape, intType);
      const group = makeGroup('group', [dataset], {
        attributes: [makeStrAttr('signal', 'dataset')],
      });

      expect(() => findSignalDataset(group)).toThrow(/to have simple shape/u);
    });

    it('should throw if signal dataset has no dimensions', () => {
      const dataset = makeDataset('dataset', makeSimpleShape([]), stringType);
      const group = makeGroup('group', [dataset], {
        attributes: [makeStrAttr('signal', 'dataset')],
      });

      expect(() => findSignalDataset(group)).toThrow(/to have dimensions/u);
    });

    it('should throw if signal dataset has non-numeric type', () => {
      const dataset = makeDataset('dataset', makeSimpleShape([1]), stringType);
      const group = makeGroup('group', [dataset], {
        attributes: [makeStrAttr('signal', 'dataset')],
      });

      expect(() => findSignalDataset(group)).toThrow(/to have numeric type/u);
    });
  });

  describe('isNxInterpretation', () => {
    it('should return `true` with known NeXus interpretation', () => {
      expect(isNxInterpretation('spectrum')).toBe(true);
    });

    it('should return `false` with invalid or unknown NeXus interpretation', () => {
      expect(isNxInterpretation(42)).toBe(false);
      expect(isNxInterpretation('unknown')).toBe(false);
    });
  });

  describe('getNxAxes', () => {
    it('should return array of axes', () => {
      const axesAttr = makeNxAxesAttr(['X', 'Y']);
      const group = makeGroup('foo', [], { attributes: [axesAttr] });

      expect(getNxAxes(group)).toEqual(['X', 'Y']);
    });

    it('should wrap single axis string in array', () => {
      const axesAttr = makeStrAttr('axes', 'X');
      const group = makeGroup('foo', [], { attributes: [axesAttr] });

      expect(getNxAxes(group)).toEqual(['X']);
    });

    it('should return empty array if group has no `axes` attribute', () => {
      const group = makeGroup('foo');
      expect(getNxAxes(group)).toEqual([]);
    });

    it('should throw if `axes` value is neither string nor array', () => {
      const axesAttr = makeIntAttr('axes', 42);
      const group = makeGroup('foo', [], { attributes: [axesAttr] });

      expect(() => getNxAxes(group)).toThrow(/array/u);
    });
  });

  describe('getDatasetLabel', () => {
    it('should return value of `long_name` attribute in priority if available', () => {
      const dataset = makeDataset('foo', scalarShape, intType, {
        attributes: [
          makeStrAttr('long_name', 'Foobar'),
          makeStrAttr('units', 'nm'),
        ],
      });

      expect(getDatasetLabel(dataset)).toBe('Foobar');
    });

    it('should combine dataset name and value of `units` attribute if available', () => {
      const dataset = makeDataset('foo', scalarShape, intType, {
        attributes: [makeStrAttr('units', 'nm')],
      });

      expect(getDatasetLabel(dataset)).toBe('foo (nm)');
    });

    it('should fall back to dataset name when other attributes are absent or not string', () => {
      const dataset1 = makeDataset('foo', scalarShape, intType);
      const dataset2 = makeDataset('foo', scalarShape, intType, {
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
        axesScaleType: [ScaleType.Log],
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
        axesScaleType: [ScaleType.Log],
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
        axesScaleType: undefined,
      });
    });
  });

  it('should return empty object and warn to console if `SILX_style` attribute value is not valid, stringified JSON', () => {
    const { consoleMock, resetConsole } = mockConsoleMethod('warn');

    const group = makeGroup('foo', [], {
      attributes: [makeStrAttr('SILX_style', '{')],
    });

    expect(getSilxStyle(group)).toEqual({});
    expect(consoleMock).toHaveBeenCalledWith(
      expect.stringMatching(/Malformed/u)
    );

    resetConsole();
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
});
