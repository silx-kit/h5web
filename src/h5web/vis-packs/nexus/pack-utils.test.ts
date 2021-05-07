import { getSupportedVis } from './pack-utils';
import {
  intType,
  floatType,
  makeStrAttr,
  makeGroup,
  makeNxDataGroup,
  withNxInterpretation,
  makeNxGroup,
  withAttributes,
  makeDataset,
  complexType,
} from '../../providers/mock/metadata-utils';
import { NexusVis, NEXUS_VIS } from './visualizations';
import { NxInterpretation } from './models';

const datasetInt1D = makeDataset('dataset_int_1d', intType, [5]);
const datasetInt2D = makeDataset('dataset_int_2d', intType, [5, 3]);
const datasetFlt3D = makeDataset('dataset_flt_3d', floatType, [5, 3, 1]);
const datasetCplx2D = makeDataset('dataset_cplx_2d', complexType, [5, 3]);

describe('getSupportedVis', () => {
  it('should not include NxSpectrum vis if any other visualization is supported', () => {
    const nxDataSignal2D = makeNxDataGroup('foo', { signal: datasetInt2D });
    const supportedVis = getSupportedVis(nxDataSignal2D);

    expect(supportedVis).toEqual(NEXUS_VIS[NexusVis.NxImage]);
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

    expect(getSupportedVis(spectrum1D)).toBe(NEXUS_VIS[NexusVis.NxSpectrum]);
    expect(getSupportedVis(spectrum2D)).toBe(NEXUS_VIS[NexusVis.NxSpectrum]);
    expect(getSupportedVis(image2D)).toBe(NEXUS_VIS[NexusVis.NxImage]);
  });

  it('should get supported visualization based on dataset shape', () => {
    const signal1D = makeNxDataGroup('foo', { signal: datasetInt1D });
    expect(getSupportedVis(signal1D)).toBe(NEXUS_VIS[NexusVis.NxSpectrum]);

    const signal2D = makeNxDataGroup('foo', { signal: datasetInt2D });
    expect(getSupportedVis(signal2D)).toBe(NEXUS_VIS[NexusVis.NxImage]);

    const signal3D = makeNxDataGroup('foo', { signal: datasetFlt3D });
    expect(getSupportedVis(signal3D)).toBe(NEXUS_VIS[NexusVis.NxImage]);
  });

  it('should return NxComplex for complex 2D datasets', () => {
    const signalComplex = makeNxDataGroup('foo', { signal: datasetCplx2D });
    expect(getSupportedVis(signalComplex)).toBe(NEXUS_VIS[NexusVis.NxComplex]);
  });

  it('should fallback to dataset shape when interpretation is unknown', () => {
    const unknown = makeNxDataGroup('foo', {
      signal: withAttributes(datasetInt2D, [
        makeStrAttr('interpretation', 'unknown'),
      ]),
    });

    expect(getSupportedVis(unknown)).toBe(NEXUS_VIS[NexusVis.NxImage]);
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
