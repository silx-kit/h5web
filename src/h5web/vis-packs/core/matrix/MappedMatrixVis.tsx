import type { ReactElement } from 'react';
import type { HDF5Value } from '../../../providers/hdf5-models';
import MatrixVis from './MatrixVis';
import { assertArray } from '../../../guards';
import { useBaseArray, useMappedArray } from '../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../hooks';

interface Props {
  value: HDF5Value;
  dims: number[];
}

function MappedMatrixVis(props: Props): ReactElement {
  const { value, dims } = props;
  assertArray<number | string>(value);

  const axesCount = Math.min(dims.length, 2);
  const [dimMapping, setDimMapping] = useDimMappingState(dims, axesCount);

  const baseArray = useBaseArray(value, dims);
  const mappedArray = useMappedArray(baseArray, dimMapping);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <MatrixVis dataArray={mappedArray} />
    </>
  );
}

export default MappedMatrixVis;
