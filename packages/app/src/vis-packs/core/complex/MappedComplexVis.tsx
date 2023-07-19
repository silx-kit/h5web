import {
  HeatmapVis,
  useSafeDomain,
  useValidDomainForScale,
  useVisDomain,
} from '@h5web/lib';
import type { AxisMapping, H5WebComplex, NumArray } from '@h5web/shared';
import { useMemo } from 'react';
import { createPortal } from 'react-dom';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import type { HeatmapConfig } from '../heatmap/config';
import {
  useBaseArray,
  useMappedArray,
  useSlicedDimsAndMapping,
} from '../hooks';
import { DEFAULT_DOMAIN } from '../utils';
import ComplexToolbar from './ComplexToolbar';
import type { ComplexConfig } from './config';
import { ComplexVisType } from './models';
import { getPhaseAmplitudeValues } from './utils';

interface Props {
  value: H5WebComplex[];
  dims: number[];
  dimMapping: DimensionMapping;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<NumArray>;
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
  config: ComplexConfig;
  heatmapConfig: HeatmapConfig;
}

function MappedComplexVis(props: Props) {
  const {
    value,
    dims,
    dimMapping,
    axisLabels,
    axisValues,
    title,
    toolbarContainer,
    config,
    heatmapConfig,
  } = props;

  const { visType } = config;
  const {
    customDomain,
    colorMap,
    scaleType,
    keepRatio,
    showGrid,
    invertColorMap,
  } = heatmapConfig;

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);

  const [mappedArray] = useMappedArray(value, slicedDims, slicedMapping);

  const { phaseValues, phaseBounds, amplitudeValues, amplitudeBounds } =
    useMemo(() => getPhaseAmplitudeValues(mappedArray.data), [mappedArray]);

  const phaseArray = useBaseArray(phaseValues, mappedArray.shape);
  const amplitudeArray = useBaseArray(amplitudeValues, mappedArray.shape);

  const phaseDomain =
    useValidDomainForScale(phaseBounds, scaleType) || DEFAULT_DOMAIN;
  const amplitudeDomain =
    useValidDomainForScale(amplitudeBounds, scaleType) || DEFAULT_DOMAIN;

  const dataArray =
    visType !== ComplexVisType.Amplitude ? phaseArray : amplitudeArray;
  const dataDomain =
    visType !== ComplexVisType.Amplitude ? phaseDomain : amplitudeDomain;

  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, scaleType);

  const xDimIndex = dimMapping.indexOf('x');
  const yDimIndex = dimMapping.indexOf('y');

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <ComplexToolbar
            dataDomain={dataDomain}
            config={config}
            heatmapConfig={heatmapConfig}
          />,
          toolbarContainer,
        )}

      <HeatmapVis
        dataArray={dataArray}
        domain={safeDomain}
        title={`${title} (${visType.toLowerCase()})`}
        colorMap={colorMap}
        scaleType={scaleType}
        aspect={keepRatio ? 'equal' : 'auto'}
        showGrid={showGrid}
        invertColorMap={invertColorMap}
        abscissaParams={{
          label: axisLabels?.[xDimIndex],
          value: axisValues?.[xDimIndex],
        }}
        ordinateParams={{
          label: axisLabels?.[yDimIndex],
          value: axisValues?.[yDimIndex],
        }}
        alpha={
          visType === ComplexVisType.PhaseAmplitude
            ? {
                array: amplitudeArray,
                domain: amplitudeDomain,
              }
            : undefined
        }
      />
    </>
  );
}

export default MappedComplexVis;
