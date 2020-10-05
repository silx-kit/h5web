import React, { ReactElement, useEffect } from 'react';
import type { HDF5Dataset, HDF5Value } from '../../providers/models';
import type { DimensionMapping } from '../../dataset-visualizer/models';
import LineVis from './LineVis';
import { assertArray } from '../shared/utils';
import { useMappedArray, useDataDomain, useBaseArray } from '../shared/hooks';
import { useLineConfig } from './config';

interface Props {
  value: HDF5Value;
  dataset: HDF5Dataset;
  mapperState: DimensionMapping;
}

function MappedLineVis(props: Props): ReactElement {
  const { value, dataset, mapperState } = props;
  assertArray<number>(value);

  const {
    scaleType,
    curveType,
    showGrid,
    autoScale,
    disableAutoScale,
  } = useLineConfig();

  const baseArray = useBaseArray(dataset, value);
  const dataArray = useMappedArray(baseArray, mapperState);

  // Disable `autoScale` for 1D datasets (baseArray and dataArray are the same)
  useEffect(() => {
    disableAutoScale(!baseArray.shape || baseArray.shape.length <= 1);
  }, [baseArray.shape, disableAutoScale]);

  const dataDomain = useDataDomain(
    (autoScale ? dataArray.data : baseArray.data) as number[]
  );

  return (
    <LineVis
      dataArray={dataArray}
      domain={dataDomain}
      scaleType={scaleType}
      curveType={curveType}
      showGrid={showGrid}
    />
  );
}

export default MappedLineVis;
