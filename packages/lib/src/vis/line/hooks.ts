import { createMemo } from '@h5web/shared';

import { getAxisValues } from './utils';

export const useAxisValues = createMemo(getAxisValues);
