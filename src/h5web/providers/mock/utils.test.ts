import { intType, makeDataset, makeGroup, scalarShape } from './metadata-utils';
import { findMockEntity } from './utils';

describe('MockProvider utilities', () => {
  describe('findMockEntity', () => {
    const dataset = makeDataset('dataset', scalarShape, intType);
    const childGroup1 = makeGroup('child1');
    const childGroup2 = makeGroup('child2', [dataset]);
    const rootGroup = makeGroup('root', [childGroup1, childGroup2]);

    it('should return entity at given path', () => {
      expect(findMockEntity(rootGroup, '/')).toBe(rootGroup);
      expect(findMockEntity(rootGroup, '/child1')).toBe(childGroup1);
      expect(findMockEntity(rootGroup, '/child2/dataset')).toBe(dataset);
    });

    it('should throw if path is relative', () => {
      expect(() => findMockEntity(rootGroup, 'child1/foo')).toThrow(
        /path to start with '\/'/u
      );
    });

    it('should throw if no entity is found at given path', () => {
      expect(() => findMockEntity(rootGroup, '/child1/foo')).toThrow(
        /entity at path/u
      );
    });
  });
});
