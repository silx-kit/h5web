import { getSupportedVis } from './pack-utils';
import {
  compoundType,
  intType,
  scalarShape,
  makeDataset,
  makeGroup,
  makeSimpleDataset,
} from '../../providers/mock/metadata-utils';
import { CORE_VIS } from './visualizations';

describe('getSupportedVis', () => {
  it('should return supported visualizations', () => {
    const datasetRaw = makeDataset('raw', scalarShape, compoundType);
    const supportedVis = getSupportedVis(datasetRaw);

    expect(supportedVis).toEqual([CORE_VIS.Raw]);
  });

  it('should not include Raw vis if any other visualization is supported', () => {
    const datasetInt1D = makeSimpleDataset('dataset', intType, [5]);
    const supportedVis = getSupportedVis(datasetInt1D);

    expect(supportedVis).toEqual([CORE_VIS.Matrix, CORE_VIS.Line]);
  });

  it('should return empty array if no visualization is supported', () => {
    const groupEmpty = makeGroup('group_empty');
    const supportedVis = getSupportedVis(groupEmpty);

    expect(supportedVis).toEqual([]);
  });
});
