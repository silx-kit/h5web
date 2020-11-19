import { getSupportedVis } from './utils';
import { Vis } from '../visualizations';
import { mockMetadata } from '../providers/mock/data';

describe('Visualizer utilities', () => {
  describe('getSupportedVis', () => {
    it('should return supported visualizations', () => {
      const supportedVis = getSupportedVis(
        mockMetadata.datasets?.raw,
        mockMetadata
      );

      expect(supportedVis).toEqual({ supportedVis: [Vis.Raw] });
    });

    it('should not include Raw vis if any other visualization is supported', () => {
      const supportedVis = getSupportedVis(
        mockMetadata.datasets?.oneD,
        mockMetadata
      );

      expect(supportedVis).toEqual({ supportedVis: [Vis.Matrix, Vis.Line] });
    });

    it('should not include NxSpectrum vis if any other visualization is supported', () => {
      const supportedVis = getSupportedVis(
        mockMetadata.groups?.nx_data,
        mockMetadata
      );

      expect(supportedVis).toEqual({ supportedVis: [Vis.NxImage] });
    });

    it('should return empty array if no visualization is supported', () => {
      const supportedVis = getSupportedVis(
        mockMetadata.groups?.empty_group,
        mockMetadata
      );

      expect(supportedVis).toEqual({ supportedVis: [] });
    });

    it('should return error if entity has malformed NeXus metadata', () => {
      const supportedVis = getSupportedVis(
        mockMetadata.groups?.signal_not_string,
        mockMetadata
      );

      expect(supportedVis).toEqual({
        supportedVis: [],
        error: expect.any(TypeError),
      });
    });
  });
});
