import { createMemo } from 'react-use';
import { getVisDomain, getSafeDomain } from './utils';

export const useVisDomain = createMemo(getVisDomain);
export const useSafeDomain = createMemo(getSafeDomain);
