import { createMemo } from '@h5web/shared/createMemo';

import { getAxisValues } from './utils';

export const useAxisValues = createMemo(getAxisValues);
