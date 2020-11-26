import React, { ReactElement, useEffect, useState } from 'react';
import { usePrevious } from 'react-use';
import type { HDF5Value } from '../../providers/models';
import type { DimensionMapping } from '../../dimension-mapper/models';
import HeatmapVis from './HeatmapVis';
import { assertArray } from '../shared/utils';
import { useDomain, useDataArrays } from '../shared/hooks';
import { useHeatmapConfig } from './config';
import { AxisMapping } from '../shared/models';
import DimensionMapper from '../../dimension-mapper/DimensionMapper';

interface Props {
  value: HDF5Value;
  dims: number[];
  title?: string;
  axisMapping?: AxisMapping[];
}

function MappedHeatmapVis(props: Props): ReactElement {
  const { value, axisMapping = [], title, dims } = props;
  assertArray<number>(value);

  const {
    customDomain,
    colorMap,
    scaleType,
    keepAspectRatio,
    showGrid,
    resetDomains,
    autoScale,
    disableAutoScale,
  } = useHeatmapConfig();

  const [dimensionMapping, setDimensionMapping] = useState<DimensionMapping>([
    ...new Array(dims.length - 2).fill(0),
    'y',
    'x',
  ]);

  const { baseArray, mappedArray: dataArray } = useDataArrays(
    value,
    dims,
    dimensionMapping
  );
  const dataDomain = useDomain(
    (autoScale ? dataArray.data : baseArray.data) as number[],
    scaleType
  );
  const prevDataDomain = usePrevious(dataDomain);

  // Disable `autoScale` for 2D datasets (baseArray and dataArray span the same values)
  useEffect(() => {
    disableAutoScale(baseArray.shape.length <= 2);
  }, [baseArray.shape, disableAutoScale]);

  // Use `customDomain` if any, unless `dataDomain` just changed (in which case it is stale and needs to be reset - cf. `useEffect` below)
  const domain =
    customDomain && dataDomain === prevDataDomain ? customDomain : dataDomain;

  useEffect(() => {
    resetDomains(dataDomain); // in config, update `dataDomain` and reset `customDomain`
  }, [dataDomain, resetDomains]);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimensionMapping}
        onChange={setDimensionMapping}
      />
      <HeatmapVis
        dataArray={dataArray}
        title={title}
        domain={domain}
        colorMap={colorMap}
        scaleType={scaleType}
        keepAspectRatio={keepAspectRatio}
        showGrid={showGrid}
        abscissaParams={axisMapping[dimensionMapping.indexOf('x')]}
        ordinateParams={axisMapping[dimensionMapping.indexOf('y')]}
      />
    </>
  );
}

export default MappedHeatmapVis;
