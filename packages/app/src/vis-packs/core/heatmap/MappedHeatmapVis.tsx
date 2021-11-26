import { HeatmapVis } from '@h5web/lib';
import type { NumericType, ScaleType } from '@h5web/shared';
import { useEffect } from 'react';
import shallow from 'zustand/shallow';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useDomain, useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import type { AxisMapping } from '../models';
import { DEFAULT_DOMAIN } from '../utils';
import { useHeatmapConfig } from './config';
import { useSafeDomain, useVisDomain } from './hooks';

interface Props {
  value: number[];
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title: string;
  colorScaleType?: ScaleType;
  dtype?: NumericType;
}

function MappedHeatmapVis(props: Props) {
  const {
    value,
    dims,
    dimMapping,
    axisMapping = [],
    title,
    dtype,
    colorScaleType,
  } = props;

  const {
    customDomain,
    colorMap,
    scaleType,
    layout,
    showGrid,
    setDataDomain,
    setScaleType,
    invertColorMap,
    flipYAxis,
  } = useHeatmapConfig((state) => state, shallow);

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);

  const [dataArray] = useMappedArray(value, slicedDims, slicedMapping);

  const dataDomain = useDomain(dataArray, scaleType) || DEFAULT_DOMAIN;

  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, scaleType);

  useEffect(() => {
    setDataDomain(dataDomain);
  }, [dataDomain, setDataDomain]);

  useEffect(() => {
    if (colorScaleType) {
      setScaleType(colorScaleType);
    }
  }, [setScaleType, colorScaleType]);

  return (
    <HeatmapVis
      dataArray={dataArray}
      title={title}
      dtype={dtype}
      domain={safeDomain}
      colorMap={colorMap}
      scaleType={scaleType}
      layout={layout}
      showGrid={showGrid}
      invertColorMap={invertColorMap}
      abscissaParams={axisMapping[dimMapping.indexOf('x')]}
      ordinateParams={axisMapping[dimMapping.indexOf('y')]}
      flipYAxis={flipYAxis}
    />
  );
}

export default MappedHeatmapVis;
