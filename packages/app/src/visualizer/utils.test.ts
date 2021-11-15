import {
  complexType,
  compoundType,
  floatType,
  intType,
  makeDataset,
  makeGroup,
  makeNxDataGroup,
  makeNxGroup,
  makeScalarDataset,
  makeStrAttr,
  withAttributes,
  withNxInterpretation,
} from '@h5web/shared/src/mock/metadata-utils';
import { NxInterpretation } from '@h5web/shared/src/models-nexus';

import { CORE_VIS } from '../vis-packs/core/visualizations';
import { NexusVis, NEXUS_VIS } from '../vis-packs/nexus/visualizations';
import { getSupportedCoreVis, getSupportedNxVis } from './utils';

const datasetInt1D = makeDataset('dataset_int_1d', intType, [5]);
const datasetInt2D = makeDataset('dataset_int_2d', intType, [5, 3]);
const datasetFlt3D = makeDataset('dataset_flt_3d', floatType, [5, 3, 1]);
const datasetCplx1D = makeDataset('dataset_cplx_1d', complexType, [5]);
const datasetCplx2D = makeDataset('dataset_cplx_2d', complexType, [5, 3]);
const datasetCplx3D = makeDataset('dataset_cplx_3d', complexType, [5, 3, 1]);

describe('getSupportedCoreVis', () => {
  it('should return supported visualizations', () => {
    const datasetRaw = makeScalarDataset('raw', compoundType);
    const supportedVis = getSupportedCoreVis(datasetRaw);

    expect(supportedVis).toEqual([CORE_VIS.Raw]);
  });

  it('should not include Raw vis if any other visualization is supported', () => {
    const datasetInt1D = makeDataset('dataset', intType, [5]);
    const supportedVis = getSupportedCoreVis(datasetInt1D);

    expect(supportedVis).toEqual([CORE_VIS.Matrix, CORE_VIS.Line]);
  });

  it('should return empty array if no visualization is supported', () => {
    const groupEmpty = makeGroup('group_empty');
    const supportedVis = getSupportedCoreVis(groupEmpty);

    expect(supportedVis).toEqual([]);
  });
});

describe('getSupportedNxVis', () => {
  it('should not include NxSpectrum vis if any other visualization is supported', () => {
    const nxDataSignal2D = makeNxDataGroup('foo', { signal: datasetInt2D });
    const supportedVis = getSupportedNxVis(nxDataSignal2D);

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

    expect(getSupportedNxVis(spectrum1D)).toBe(NEXUS_VIS[NexusVis.NxSpectrum]);
    expect(getSupportedNxVis(spectrum2D)).toBe(NEXUS_VIS[NexusVis.NxSpectrum]);
    expect(getSupportedNxVis(image2D)).toBe(NEXUS_VIS[NexusVis.NxImage]);
    expect(getSupportedNxVis(rgb3D)).toBe(NEXUS_VIS[NexusVis.NxRGB]);
  });

  it('should get supported visualization based on dataset shape', () => {
    const signal1D = makeNxDataGroup('foo', { signal: datasetInt1D });
    expect(getSupportedNxVis(signal1D)).toBe(NEXUS_VIS[NexusVis.NxSpectrum]);

    const signal2D = makeNxDataGroup('foo', { signal: datasetInt2D });
    expect(getSupportedNxVis(signal2D)).toBe(NEXUS_VIS[NexusVis.NxImage]);

    const signal3D = makeNxDataGroup('foo', { signal: datasetFlt3D });
    expect(getSupportedNxVis(signal3D)).toBe(NEXUS_VIS[NexusVis.NxImage]);
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

    expect(getSupportedNxVis(spectrum1D)).toBe(
      NEXUS_VIS[NexusVis.NxComplexSpectrum]
    );
    expect(getSupportedNxVis(spectrum2D)).toBe(
      NEXUS_VIS[NexusVis.NxComplexSpectrum]
    );
    expect(getSupportedNxVis(image2D)).toBe(NEXUS_VIS[NexusVis.NxComplexImage]);
  });

  it('should get supported complex visualization based on dataset shape', () => {
    const signal1D = makeNxDataGroup('foo', { signal: datasetCplx1D });
    expect(getSupportedNxVis(signal1D)).toBe(
      NEXUS_VIS[NexusVis.NxComplexSpectrum]
    );

    const signal2D = makeNxDataGroup('foo', { signal: datasetCplx2D });
    expect(getSupportedNxVis(signal2D)).toBe(
      NEXUS_VIS[NexusVis.NxComplexImage]
    );

    const signal3D = makeNxDataGroup('foo', { signal: datasetCplx3D });
    expect(getSupportedNxVis(signal3D)).toBe(
      NEXUS_VIS[NexusVis.NxComplexImage]
    );
  });

  it('should fall back to dataset shape when interpretation is unknown', () => {
    const unknown = makeNxDataGroup('foo', {
      signal: withAttributes(datasetInt2D, [
        makeStrAttr('interpretation', 'unknown'),
      ]),
    });

    expect(getSupportedNxVis(unknown)).toBe(NEXUS_VIS[NexusVis.NxImage]);
  });

  it('should fall back to dataset shape when dataset is incompatible with interpretation', () => {
    const rgbInt1D = makeNxDataGroup('foo', {
      signal: withNxInterpretation(datasetInt1D, NxInterpretation.RGB),
    });

    const rgbCplx3D = makeNxDataGroup('foo', {
      signal: withNxInterpretation(datasetCplx3D, NxInterpretation.RGB),
    });

    expect(getSupportedNxVis(rgbInt1D)).toBe(NEXUS_VIS[NexusVis.NxSpectrum]);
    expect(getSupportedNxVis(rgbCplx3D)).toBe(
      NEXUS_VIS[NexusVis.NxComplexImage]
    );
  });

  it('should return undefined if no visualization is supported', () => {
    expect(getSupportedNxVis(datasetInt1D)).toBeUndefined();

    const emptyGroup = makeGroup('group_empty');
    expect(getSupportedNxVis(emptyGroup)).toBeUndefined();

    const nxEntryGroup = makeNxGroup('nxentry', 'NXentry');
    expect(getSupportedNxVis(nxEntryGroup)).toBeUndefined();
  });

  it('should throw if entity has malformed NeXus metadata', () => {
    const noSignal = makeNxGroup('foo', 'NXdata', {
      attributes: [makeStrAttr('signal', 'bar')],
    });

    expect(() => getSupportedNxVis(noSignal)).toThrow(/signal entity to exist/);
  });
});
