import { getSafeDomain, getVisDomain } from '@h5web/lib';
import { createMemo } from 'react-use';

export const useVisDomain = createMemo(getVisDomain);
export const useSafeDomain = createMemo(getSafeDomain);
