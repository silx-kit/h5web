import React, { ReactElement, useEffect } from 'react';
import type { HDF5Value } from '../../providers/models';
import type { DimensionMapping } from '../../dimension-mapper/models';
import LineVis from './LineVis';
import { assertArray, assertOptionalArray } from '../shared/utils';
import { useMappedArray, useDomain, useBaseArray } from '../shared/hooks';
import { useLineConfig } from './config';

interface Props {
  value: HDF5Value;
  dims: number[];
  mapperState: DimensionMapping;
  valueLabel?: string;
  axesLabels?: (string | undefined)[];
  axesValues?: Record<string, HDF5Value>;
}

function MappedLineVis(props: Props): ReactElement {
  const {
    value,
    valueLabel,
    axesLabels = [],
    axesValues = {},
    dims,
    mapperState,
  } = props;
  assertArray<number>(value);

  const {
    scaleType,
    curveType,
    showGrid,
    autoScale,
    disableAutoScale,
  } = useLineConfig();

  const baseArray = useBaseArray(value, dims);
  const dataArray = useMappedArray(baseArray, mapperState);

  // Disable `autoScale` for 1D datasets (baseArray and dataArray are the same)
  useEffect(() => {
    disableAutoScale(!baseArray.shape || baseArray.shape.length <= 1);
  }, [baseArray.shape, disableAutoScale]);

  const dataDomain = useDomain(
    (autoScale ? dataArray.data : baseArray.data) as number[],
    scaleType
  );

  const abscissaLabel = mapperState && axesLabels[mapperState.indexOf('x')];
  const abscissas = abscissaLabel && axesValues[abscissaLabel];
  assertOptionalArray<number>(abscissas);

  return (
    <LineVis
      dataArray={dataArray}
      domain={dataDomain}
      scaleType={scaleType}
      curveType={curveType}
      showGrid={showGrid}
      abscissaParams={{
        label: abscissaLabel,
        values: abscissas,
      }}
      ordinateLabel={valueLabel}
    />
  );
}

export default MappedLineVis;
