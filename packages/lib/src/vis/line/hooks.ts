import { createMemo } from '@h5web/shared';

import { getValueToErrorPositions, getValueToPosition } from './utils';

export const useValueToPosition = createMemo(getValueToPosition);
export const useValueToErrorPositions = createMemo(getValueToErrorPositions);
