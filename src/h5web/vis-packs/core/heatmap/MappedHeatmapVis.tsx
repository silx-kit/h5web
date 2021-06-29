import { useEffect } from 'react';
import HeatmapVis from './HeatmapVis';
import { useDomain, useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import { useHeatmapConfig } from './config';
import type { AxisMapping, ScaleType } from '../models';
import { DEFAULT_DOMAIN } from '../utils';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import shallow from 'zustand/shallow';
import { useSafeDomain, useVisDomain } from './hooks';

interface Props {
  value: number[];
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title: string;
  colorScaleType?: ScaleType;
}

function MappedHeatmapVis(props: Props) {
  const {
    value,
    dims,
    dimMapping,
    axisMapping = [],
    title,
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
