import { getSupportedVis } from './pack-utils';
import {
  intType,
  floatType,
  makeStrAttr,
  makeGroup,
  makeNxDataGroup,
  makeSimpleDataset,
  withNxInterpretation,
  makeNxGroup,
  withAttributes,
} from '../../providers/mock/metadata-utils';
import { NEXUS_VIS } from './visualizations';
import { NxInterpretation } from './models';

const datasetInt1D = makeSimpleDataset('dataset_int_1d', intType, [5]);
const datasetInt2D = makeSimpleDataset('dataset_int_2d', intType, [5, 3]);
const datasetFlt3D = makeSimpleDataset('dataset_flt_3d', floatType, [5, 3, 1]);

describe('getSupportedVis', () => {
  it('should not include NxSpectrum vis if any other visualization is supported', () => {
    const datasetInt2D = makeSimpleDataset('dataset', intType, [5, 3]);
    const nxDataSignal2D = makeNxDataGroup('foo', { signal: datasetInt2D });
    const supportedVis = getSupportedVis(nxDataSignal2D);

    expect(supportedVis).toEqual(NEXUS_VIS.image);
  });

  it('should get supported visualization based on `interpretation` attribute', () => {
    const spectrum1D = makeNxDataGroup('foo', {
      signal: withNxInterpretation(datasetInt1D, NxInterpretation.Spectrum),
    });

    const spectrum2D = makeNxDataGroup('foo', {
      signal: withNxInterpretation(datasetInt2D, NxInterpretation.Spectrum),
    });

    const image2D = makeNxDataGroup('foo', {
      signal: withNxInterpretation(datasetInt2D, NxInterpretation.Image),
    });

    expect(getSupportedVis(spectrum1D)).toBe(NEXUS_VIS.spectrum);
    expect(getSupportedVis(spectrum2D)).toBe(NEXUS_VIS.spectrum);
    expect(getSupportedVis(image2D)).toBe(NEXUS_VIS.image);
  });

  it('should get supported visualization based on dataset shape', () => {
    const signal1D = makeNxDataGroup('foo', { signal: datasetInt1D });
    expect(getSupportedVis(signal1D)).toBe(NEXUS_VIS.spectrum);

    const signal2D = makeNxDataGroup('foo', { signal: datasetInt2D });
    expect(getSupportedVis(signal2D)).toBe(NEXUS_VIS.image);

    const signal3D = makeNxDataGroup('foo', { signal: datasetFlt3D });
    expect(getSupportedVis(signal3D)).toBe(NEXUS_VIS.image);
  });

  it('should fallback to dataset shape when interpretation is unknown', () => {
    const unknown = makeNxDataGroup('foo', {
      signal: withAttributes(datasetInt2D, [
        makeStrAttr('interpretation', 'unknown'),
      ]),
    });

    expect(getSupportedVis(unknown)).toBe(NEXUS_VIS.image);
  });

  it('should return undefined if no visualization is supported', () => {
    expect(getSupportedVis(datasetInt1D)).toBeUndefined();

    const emptyGroup = makeGroup('group_empty');
    expect(getSupportedVis(emptyGroup)).toBeUndefined();

    const nxEntryGroup = makeNxGroup('nxentry', 'NXentry');
    expect(getSupportedVis(nxEntryGroup)).toBeUndefined();
  });

  it('should throw if entity has malformed NeXus metadata', () => {
    const noSignal = makeNxGroup('foo', 'NXdata', {
      attributes: [makeStrAttr('signal', 'bar')],
    });

    expect(() => getSupportedVis(noSignal)).toThrow(/signal entity to exist/);
  });
});
