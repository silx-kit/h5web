import { ComplexVisType } from '@h5web/lib';
import type { H5WebComplex } from '@h5web/shared/hdf5-models';
import type { ComplexLineVisType } from '@h5web/shared/vis-models';
import type { NdArray } from 'ndarray';
import { useMemo } from 'react';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useSlicedDimsAndMapping } from '../hooks';
import { applyMapping, getBaseArray } from '../utils';
import { getPhaseAmplitudeValues } from './utils';

export function useMappedComplexArrays(
  values: H5WebComplex[][],
  dims: number[],
  mapping: DimensionMapping,
  complexVisType: ComplexLineVisType,
): NdArray<number[]>[] {
  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, mapping);

  const phaseAmplitudeValues = useMemo(
    () => values.map(getPhaseAmplitudeValues),
    [...values], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const baseArrays = useMemo(() => {
    return phaseAmplitudeValues.map((paValues) =>
      getBaseArray(
        complexVisType === ComplexVisType.Phase
          ? paValues.phaseValues
          : paValues.amplitudeValues,
        slicedDims,
      ),
    );
  }, [complexVisType, slicedDims, phaseAmplitudeValues]);

  return useMemo(
    () => baseArrays.map((ndArr) => applyMapping(ndArr, slicedMapping)),
    [baseArrays, slicedMapping],
  );
}
