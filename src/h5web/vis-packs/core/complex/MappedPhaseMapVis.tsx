import { useEffect, useMemo } from 'react';
import { useDatasetValue, useMappedArray } from '../hooks';
import { useHeatmapConfig } from '../heatmap/config';
import type { AxisMapping, ScaleType } from '../models';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import { isAxis } from '../../../dimension-mapper/utils';
import shallow from 'zustand/shallow';
import { useSafeDomain, useVisDomain } from '../heatmap/hooks';
import type {
  ArrayShape,
  ComplexType,
  Dataset,
} from '../../../providers/models';
import { usePhaseAmplitude } from './hooks';
import HeatmapVis from '../heatmap/HeatmapVis';
import { DEFAULT_DOMAIN } from '../utils';

interface Props {
  dataset: Dataset<ArrayShape, ComplexType>;
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title?: string;
  colorScaleType?: ScaleType;
}

function MappedPhaseMapVis(props: Props) {
  const {
    dataset,
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
    keepAspectRatio,
    showGrid,
    setDataDomain,
    setScaleType,
    invertColorMap,
  } = useHeatmapConfig((state) => state, shallow);

  const value = useDatasetValue(dataset, dimMapping);

  const [slicedDims, slicedMapping] = useMemo(
    () => [
      dims.filter((_, i) => isAxis(dimMapping[i])),
      dimMapping.filter((dim) => isAxis(dim)),
    ],
    [dims, dimMapping]
  );

  const [mappedArray] = useMappedArray(value, slicedDims, slicedMapping);

  const {
    phaseArray,
    phaseDomain = DEFAULT_DOMAIN,
    amplitudeArray,
    amplitudeDomain = DEFAULT_DOMAIN,
  } = usePhaseAmplitude(mappedArray, colorScaleType);

  const visPhaseDomain = useVisDomain(customDomain, phaseDomain);
  const [safePhaseDomain] = useSafeDomain(
    visPhaseDomain,
    phaseDomain,
    scaleType
  );

  useEffect(() => {
    setDataDomain(phaseDomain);
  }, [phaseDomain, setDataDomain]);

  useEffect(() => {
    if (colorScaleType) {
      setScaleType(colorScaleType);
    }
  }, [setScaleType, colorScaleType]);

  return (
    <HeatmapVis
      dataArray={phaseArray}
      domain={safePhaseDomain}
      alphaArray={amplitudeArray}
      alphaDomain={amplitudeDomain}
      title={title}
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

export default MappedPhaseMapVis;
