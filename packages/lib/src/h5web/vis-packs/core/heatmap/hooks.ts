import { createMemo } from 'react-use';
import { getVisDomain, getSafeDomain, getAxisValues } from './utils';

export const useVisDomain = createMemo(getVisDomain);
export const useSafeDomain = createMemo(getSafeDomain);
export const useAxisValues = createMemo(getAxisValues);
