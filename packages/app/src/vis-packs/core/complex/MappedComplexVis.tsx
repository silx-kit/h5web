import { HeatmapVis } from '@h5web/lib';
import type { H5WebComplex, ScaleType } from '@h5web/shared';
import { useEffect } from 'react';
import shallow from 'zustand/shallow';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useHeatmapConfig } from '../heatmap/config';
import { useSafeDomain, useVisDomain } from '../heatmap/hooks';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import type { AxisMapping } from '../models';
import { DEFAULT_DOMAIN } from '../utils';
import { useComplexConfig } from './config';
import { usePhaseAmplitudeArrays } from './hooks';
import { ComplexVisType } from './models';

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
