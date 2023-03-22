import { createMemo } from '@h5web/shared';

import { getValueToColor, getIndexToPosition } from './utils';

export const useIndexToPosition = createMemo(getIndexToPosition);
export const useValueToColor = createMemo(getValueToColor);
