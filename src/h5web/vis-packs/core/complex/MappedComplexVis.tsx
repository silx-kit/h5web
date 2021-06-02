import { useEffect } from 'react';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import type { AxisMapping, ScaleType } from '../models';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import shallow from 'zustand/shallow';
import { useSafeDomain, useVisDomain } from '../heatmap/hooks';
import type { H5WebComplex } from '../../../providers/models';
import { usePhaseAmplitudeArrays } from './hooks';
import HeatmapVis from '../heatmap/HeatmapVis';
import { DEFAULT_DOMAIN } from '../utils';
import { ComplexVisType } from './models';
import { useComplexConfig } from './config';
import { useHeatmapConfig } from '../heatmap/config';

interface Props {
  value: H5WebComplex[];
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title: string;
  colorScaleType?: ScaleType;
}

function MappedComplexVis(props: Props) {
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
  } = useHeatmapConfig((state) => state, shallow);

  const { visType } = useComplexConfig((state) => state, shallow);

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);

  const [mappedArray] = useMappedArray(value, slicedDims, slicedMapping);

  const {
    phaseArray,
    phaseDomain = DEFAULT_DOMAIN,
    amplitudeArray,
    amplitudeDomain = DEFAULT_DOMAIN,
  } = usePhaseAmplitudeArrays(mappedArray, scaleType);

  const dataArray =
    visType !== ComplexVisType.Amplitude ? phaseArray : amplitudeArray;
  const dataDomain =
    visType !== ComplexVisType.Amplitude ? phaseDomain : amplitudeDomain;

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
      domain={safeDomain}
      alphaArray={
        visType === ComplexVisType.PhaseAmplitude ? amplitudeArray : undefined
      }
      alphaDomain={
        visType === ComplexVisType.PhaseAmplitude ? amplitudeDomain : undefined
      }
      title={title ? `${title} (${visType.toLowerCase()})` : visType}
      colorMap={colorMap}
      scaleType={scaleType}
      layout={layout}
      showGrid={showGrid}
      invertColorMap={invertColorMap}
      abscissaParams={axisMapping[dimMapping.indexOf('x')]}
      ordinateParams={axisMapping[dimMapping.indexOf('y')]}
    />
  );
}

export default MappedComplexVis;
