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
const datasetCplx1D = makeDataset('dataset_cplx_1d', complexType, [5]);
const datasetCplx2D = makeDataset('dataset_cplx_2d', complexType, [5, 3]);
const datasetCplx3D = makeDataset('dataset_cplx_3d', complexType, [5, 3, 1]);

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

    const rgb3D = makeNxDataGroup('foo', {
      signal: withNxInterpretation(datasetFlt3D, NxInterpretation.RGB),
    });

    expect(getSupportedVis(spectrum1D)).toBe(NEXUS_VIS[NexusVis.NxSpectrum]);
    expect(getSupportedVis(spectrum2D)).toBe(NEXUS_VIS[NexusVis.NxSpectrum]);
    expect(getSupportedVis(image2D)).toBe(NEXUS_VIS[NexusVis.NxImage]);
    expect(getSupportedVis(rgb3D)).toBe(NEXUS_VIS[NexusVis.NxRGB]);
  });

  it('should get supported visualization based on dataset shape', () => {
    const signal1D = makeNxDataGroup('foo', { signal: datasetInt1D });
    expect(getSupportedVis(signal1D)).toBe(NEXUS_VIS[NexusVis.NxSpectrum]);

    const signal2D = makeNxDataGroup('foo', { signal: datasetInt2D });
    expect(getSupportedVis(signal2D)).toBe(NEXUS_VIS[NexusVis.NxImage]);

    const signal3D = makeNxDataGroup('foo', { signal: datasetFlt3D });
    expect(getSupportedVis(signal3D)).toBe(NEXUS_VIS[NexusVis.NxImage]);
  });

  it('should get supported complex visualization based on `interpretation` attribute', () => {
    const spectrum1D = makeNxDataGroup('foo', {
      signal: withNxInterpretation(datasetCplx1D, NxInterpretation.Spectrum),
    });

    const spectrum2D = makeNxDataGroup('foo', {
      signal: withNxInterpretation(datasetCplx2D, NxInterpretation.Spectrum),
    });

    const image2D = makeNxDataGroup('foo', {
      signal: withNxInterpretation(datasetCplx2D, NxInterpretation.Image),
    });

    expect(getSupportedVis(spectrum1D)).toBe(
      NEXUS_VIS[NexusVis.NxComplexSpectrum]
    );
    expect(getSupportedVis(spectrum2D)).toBe(
      NEXUS_VIS[NexusVis.NxComplexSpectrum]
    );
    expect(getSupportedVis(image2D)).toBe(NEXUS_VIS[NexusVis.NxComplexImage]);
  });

  it('should get supported complex visualization based on dataset shape', () => {
    const signal1D = makeNxDataGroup('foo', { signal: datasetCplx1D });
    expect(getSupportedVis(signal1D)).toBe(
      NEXUS_VIS[NexusVis.NxComplexSpectrum]
    );

    const signal2D = makeNxDataGroup('foo', { signal: datasetCplx2D });
    expect(getSupportedVis(signal2D)).toBe(NEXUS_VIS[NexusVis.NxComplexImage]);

    const signal3D = makeNxDataGroup('foo', { signal: datasetCplx3D });
    expect(getSupportedVis(signal3D)).toBe(NEXUS_VIS[NexusVis.NxComplexImage]);
  });

  it('should fall back to dataset shape when interpretation is unknown', () => {
    const unknown = makeNxDataGroup('foo', {
      signal: withAttributes(datasetInt2D, [
        makeStrAttr('interpretation', 'unknown'),
      ]),
    });

    expect(getSupportedVis(unknown)).toBe(NEXUS_VIS[NexusVis.NxImage]);
  });

  it('should fall back to dataset shape when dataset is incompatible with interpretation', () => {
    const rgbInt1D = makeNxDataGroup('foo', {
      signal: withNxInterpretation(datasetInt1D, NxInterpretation.RGB),
    });

    const rgbCplx3D = makeNxDataGroup('foo', {
      signal: withNxInterpretation(datasetCplx3D, NxInterpretation.RGB),
    });

    expect(getSupportedVis(rgbInt1D)).toBe(NEXUS_VIS[NexusVis.NxSpectrum]);
    expect(getSupportedVis(rgbCplx3D)).toBe(NEXUS_VIS[NexusVis.NxComplexImage]);
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
