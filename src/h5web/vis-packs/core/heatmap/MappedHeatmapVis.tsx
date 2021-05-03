import { useEffect, useMemo } from 'react';
import HeatmapVis from './HeatmapVis';
import { useDomain, useDatasetValue, useMappedArray } from '../hooks';
import { useHeatmapConfig } from './config';
import type { ScaleType } from '../models';
import { DEFAULT_DOMAIN } from '../utils';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import { isAxis } from '../../../dimension-mapper/utils';
import shallow from 'zustand/shallow';
import { useSafeDomain, useVisDomain } from './hooks';
import type {
  Dataset,
  NumArrayDataset,
  ScalarShape,
  StringType,
} from '../../../providers/models';
import { useAxisMapping } from '../../nexus/hooks';
import { getDatasetLabel } from '../../nexus/utils';
import type { AxisDatasetMapping } from '../../nexus/models';

interface Props {
  dataset: NumArrayDataset;
  dims: number[];
  dimMapping: DimensionMapping;
  titleDataset?: Dataset<ScalarShape, StringType>;
  axisDatasets?: AxisDatasetMapping;
  colorScaleType?: ScaleType;
  axisScaleTypes?: ScaleType[];
}

function MappedHeatmapVis(props: Props) {
  const {
    dataset,
    dims,
    dimMapping,
    axisDatasets = [],
    titleDataset,
    axisScaleTypes,
    colorScaleType,
  } = props;

  const {
    customDomain,
    colorMap,
    scaleType,
    keepAspectRatio,
    showGrid,
    setDataDomain,
    setScaleType,
    invertColorMap,
  } = useHeatmapConfig((state) => state, shallow);

  const value = useDatasetValue(dataset, dimMapping);

  const title = useDatasetValue(titleDataset) || getDatasetLabel(dataset);
  const axisMapping = useAxisMapping(axisDatasets, axisScaleTypes);

  const [slicedDims, slicedMapping] = useMemo(
    () => [
      dims.filter((_, i) => isAxis(dimMapping[i])),
      dimMapping.filter((dim) => isAxis(dim)),
    ],
    [dims, dimMapping]
  );

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
      keepAspectRatio={keepAspectRatio}
      showGrid={showGrid}
      invertColorMap={invertColorMap}
      abscissaParams={axisMapping[dimMapping.indexOf('x')]}
      ordinateParams={axisMapping[dimMapping.indexOf('y')]}
    />
  );
}

export default MappedHeatmapVis;
