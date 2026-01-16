import { createMemo } from '@h5web/shared/createMemo';

import { getPhaseAmplitude, getPhaseAmplitudeArrays } from './utils';

export const usePhaseAmplitude = createMemo(getPhaseAmplitude);
export const usePhaseAmplitudeArrays = createMemo(getPhaseAmplitudeArrays);
