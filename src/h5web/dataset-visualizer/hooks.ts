import { createMemo } from 'react-use';
import { getSupportedVis } from './utils';

export const useSupportedVis = createMemo(getSupportedVis);
