import { createMemo } from 'react-use';
import { getVisDomain } from './utils';

export const useVisDomain = createMemo(getVisDomain);
