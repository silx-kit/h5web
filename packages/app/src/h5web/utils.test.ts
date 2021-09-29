import {
  makeGroup,
  makeNxAxesAttr,
  makeStrAttr,
} from '@h5web/shared/src/mock/metadata-utils';
import { getAttributeValue } from './utils';

describe('getAttributeValue', () => {
  const group = makeGroup('group', [], {
    attributes: [
      makeStrAttr('signal', 'my_signal'),
      makeNxAxesAttr(['X']),
      makeStrAttr('CLASS', 'IMAGE'),
    ],
  });

  it("should return an attribute's value", () => {
    expect(getAttributeValue(group, 'signal')).toBe('my_signal');
    expect(getAttributeValue(group, 'axes')).toEqual(['X']);
    expect(getAttributeValue(group, 'CLASS')).toEqual('IMAGE');
  });

  it("should return `undefined` if attribute doesn't exist", () => {
    expect(getAttributeValue(group, 'NX_class')).toBeUndefined();
  });
});
