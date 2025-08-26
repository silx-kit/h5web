import {
  ComplexVisType,
  type DimensionMapping,
  useSlicedDimsAndMapping,
} from '@h5web/lib';
import { isComplexArray } from '@h5web/shared/guards';
import {
  type ArrayValue,
  type ComplexType,
  type NumericLikeType,
} from '@h5web/shared/hdf5-models';
import {
  type ComplexLineVisType,
  type NumArray,
} from '@h5web/shared/vis-models';
import { type NdArray } from 'ndarray';
import { useMemo } from 'react';

import { applyMapping, getBaseArray, toNumArray } from '../utils';
import { getPhaseAmplitudeValues } from './utils';

export function useMappedComplexArrays(
  values: ArrayValue<NumericLikeType | ComplexType>[],
  dims: number[],
  mapping: DimensionMapping,
  complexVisType: ComplexLineVisType,
): NdArray<NumArray>[] {
  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, mapping);

  const phaseAmplitudeValues = useMemo(
    () =>
      values.map((arr) => {
        if (isComplexArray(arr)) {
          return getPhaseAmplitudeValues(arr);
        }

        // Consider real numbers as complex numbers with no imaginary parts
        const numArray = toNumArray(arr);
        return {
          phaseValues: numArray.map(() => 0),
          amplitudeValues: numArray.map((v) => Math.abs(v)),
        };
      }),
    values, // eslint-disable-line react-hooks/exhaustive-deps
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
