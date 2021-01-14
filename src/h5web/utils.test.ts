import {
  intType,
  scalarShape,
  makeDataset,
  makeGroup,
} from './providers/mock/utils';
import { getChildEntity, getEntityAtPath } from './utils';

describe('Global utilities', () => {
  describe('getChildEntity', () => {
    const dataset = makeDataset('dataset', scalarShape, intType);
    const childGroup = makeGroup('group');
    const rootGroup = makeGroup('root', [childGroup, dataset]);

    it('should return child entity', () => {
      expect(getChildEntity(rootGroup, 'dataset')).toBe(dataset);
      expect(getChildEntity(rootGroup, 'group')).toBe(childGroup);
    });

    it("should return `undefined` if child doesn't exist", () => {
      expect(getChildEntity(childGroup, 'unknown')).toBeUndefined();
    });
  });

  describe('getEntityAtPath', () => {
    const dataset = makeDataset('dataset', scalarShape, intType);
    const childGroup1 = makeGroup('child1');
    const childGroup2 = makeGroup('child2', [dataset]);
    const rootGroup = makeGroup('root', [childGroup1, childGroup2]);

    it('should process relative path', () => {
      expect(getEntityAtPath(rootGroup, '')).toBe(rootGroup);
      expect(getEntityAtPath(childGroup1, '')).toBe(childGroup1);
      expect(getEntityAtPath(rootGroup, 'child2/dataset')).toBe(dataset);
      expect(getEntityAtPath(childGroup2, 'dataset')).toBe(dataset);
    });

    it('should process absolute path when passed root group', () => {
      expect(getEntityAtPath(rootGroup, '/')).toBe(rootGroup);
      expect(getEntityAtPath(rootGroup, '/child1')).toBe(childGroup1);
      expect(getEntityAtPath(rootGroup, '/child2/dataset')).toBe(dataset);
    });

    it('should process absolute path when passed any child group', () => {
      expect(getEntityAtPath(childGroup1, '/')).toBe(rootGroup);
      expect(getEntityAtPath(childGroup1, '/child1')).toBe(childGroup1);
      expect(getEntityAtPath(childGroup1, '/child2/dataset')).toBe(dataset);
    });

    it('should return `undefined` for invalid paths', () => {
      expect(getEntityAtPath(rootGroup, 'child1/foo')).toBeUndefined();
      expect(getEntityAtPath(rootGroup, '/child1/foo')).toBeUndefined();
      expect(getEntityAtPath(childGroup1, 'foo')).toBeUndefined();
      expect(getEntityAtPath(childGroup1, '/child2/foo')).toBeUndefined();
    });

    it('should support forbidding to retrieve same entity', () => {
      expect(getEntityAtPath(rootGroup, '', false)).toBeUndefined();
      expect(getEntityAtPath(rootGroup, '/', false)).toBeUndefined();
      expect(getEntityAtPath(childGroup1, '', false)).toBeUndefined();
      expect(getEntityAtPath(childGroup1, '/', false)).toBe(rootGroup);
    });
  });
});
