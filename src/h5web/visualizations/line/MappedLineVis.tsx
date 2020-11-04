import React, { ReactElement, useEffect } from 'react';
import type { HDF5Value } from '../../providers/models';
import type { DimensionMapping } from '../../dimension-mapper/models';
import LineVis from './LineVis';
import { assertArray } from '../shared/utils';
import { useMappedArray, useDomain, useBaseArray } from '../shared/hooks';
import { useLineConfig } from './config';
import { AxisParams } from '../shared/models';

interface Props {
  value: HDF5Value;
  dims: number[];
  dimensionMapping: DimensionMapping;
  valueLabel?: string;
  axisMapping?: (string | undefined)[];
  axesParams?: Record<string, AxisParams>;
  title?: string;
}

function MappedLineVis(props: Props): ReactElement {
  const {
    value,
    valueLabel,
    axisMapping = [],
    axesParams = {},
    dims,
    dimensionMapping,
    title,
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
  const dataArray = useMappedArray(baseArray, dimensionMapping);

  // Disable `autoScale` for 1D datasets (baseArray and dataArray are the same)
  useEffect(() => {
    disableAutoScale(!baseArray.shape || baseArray.shape.length <= 1);
  }, [baseArray.shape, disableAutoScale]);

  const dataDomain = useDomain(
    (autoScale ? dataArray.data : baseArray.data) as number[],
    scaleType
  );

  const abscissaName =
    dimensionMapping && axisMapping[dimensionMapping.indexOf('x')];

  return (
    <LineVis
      dataArray={dataArray}
      domain={dataDomain}
      scaleType={scaleType}
      curveType={curveType}
      showGrid={showGrid}
      abscissaParams={abscissaName ? axesParams[abscissaName] : undefined}
      ordinateLabel={valueLabel}
      title={title}
    />
  );
}

export default MappedLineVis;
