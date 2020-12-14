import { makeMyDataset, makeMyGroup } from './providers/mock/utils';
import { intType, scalarShape } from './providers/raw-utils';
import { getEntityAtPath } from './utils';

describe('Global utilities', () => {
  describe('getEntityAtPath', () => {
    const dataset = makeMyDataset('dataset', scalarShape, intType);
    const childGroup1 = makeMyGroup('child1');
    const childGroup2 = makeMyGroup('child2', [dataset]);
    const rootGroup = makeMyGroup('root', [childGroup1, childGroup2]);

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
