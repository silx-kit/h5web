import { createMemo } from '@h5web/shared';

import { getIndexToPosition, getValueToColor } from './utils';

export const useIndexToPosition = createMemo(getIndexToPosition);
export const useValueToColor = createMemo(getValueToColor);
