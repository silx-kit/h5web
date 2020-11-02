import React, { ReactElement, useEffect } from 'react';
import { usePrevious } from 'react-use';
import type { HDF5Value } from '../../providers/models';
import type { DimensionMapping } from '../../dimension-mapper/models';
import HeatmapVis from './HeatmapVis';
import { assertArray } from '../shared/utils';
import { useMappedArray, useDomain, useBaseArray } from '../shared/hooks';
import { useHeatmapConfig } from './config';
import { AxisParams } from '../shared/models';

interface Props {
  value: HDF5Value;
  dims: number[];
  dimensionMapping: DimensionMapping;
  title?: string;
  axisMapping?: (string | undefined)[];
  axesParams?: Record<string, AxisParams>;
}

function MappedHeatmapVis(props: Props): ReactElement {
  const {
    value,
    axisMapping = [],
    axesParams = {},
    title,
    dims,
    dimensionMapping,
  } = props;
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

  const baseArray = useBaseArray(value, dims);
  const dataArray = useMappedArray(baseArray, dimensionMapping);
  const dataDomain = useDomain(
    (autoScale ? dataArray.data : baseArray.data) as number[],
    scaleType
  );
  const prevDataDomain = usePrevious(dataDomain);

  // Disable `autoScale` for 2D datasets (baseArray and dataArray span the same values)
  useEffect(() => {
    disableAutoScale(!baseArray.shape || baseArray.shape.length <= 2);
  }, [baseArray.shape, disableAutoScale]);

  // Use `customDomain` if any, unless `dataDomain` just changed (in which case it is stale and needs to be reset - cf. `useEffect` below)
  const domain =
    customDomain && dataDomain === prevDataDomain ? customDomain : dataDomain;

  useEffect(() => {
    resetDomains(dataDomain); // in config, update `dataDomain` and reset `customDomain`
  }, [dataDomain, resetDomains]);

  const abscissaName =
    dimensionMapping && axisMapping[dimensionMapping.indexOf('x')];
  const ordinateName =
    dimensionMapping && axisMapping[dimensionMapping.indexOf('y')];

  return (
    <HeatmapVis
      dataArray={dataArray}
      title={title}
      domain={domain}
      colorMap={colorMap}
      scaleType={scaleType}
      keepAspectRatio={keepAspectRatio}
      showGrid={showGrid}
      abscissaParams={abscissaName ? axesParams[abscissaName] : undefined}
      ordinateParams={ordinateName ? axesParams[ordinateName] : undefined}
    />
  );
}

export default MappedHeatmapVis;
