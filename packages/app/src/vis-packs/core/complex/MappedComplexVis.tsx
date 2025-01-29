import {
  HeatmapVis,
  useSafeDomain,
  useValidDomainForScale,
  useVisDomain,
} from '@h5web/lib';
import {
  type ArrayValue,
  type ComplexType,
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';
import { ComplexVisType } from '@h5web/shared/vis-models';
import { useMemo } from 'react';
import { createPortal } from 'react-dom';

import { type DimensionMapping } from '../../../dimension-mapper/models';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { type HeatmapConfig } from '../heatmap/config';
import {
  useBaseArray,
  useMappedArray,
  useSlicedDimsAndMapping,
  useToNumArrays,
} from '../hooks';
import { DEFAULT_DOMAIN } from '../utils';
import ComplexToolbar from './ComplexToolbar';
import { type ComplexConfig } from './config';
import { COMPLEX_VIS_TYPE_LABELS, getPhaseAmplitudeValues } from './utils';

interface Props {
  value: ArrayValue<ComplexType>;
  dims: number[];
  dimMapping: DimensionMapping;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<ArrayValue<NumericType>>;
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
    axisLabels = [],
    axisValues = [],
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

  const numAxisArrays = useToNumArrays(axisValues);

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const mappedArray = useMappedArray(value, slicedDims, slicedMapping);

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
        className={visualizerStyles.vis}
        dataArray={dataArray}
        domain={safeDomain}
        title={`${title} (${COMPLEX_VIS_TYPE_LABELS[visType].toLowerCase()})`}
        colorMap={colorMap}
        scaleType={scaleType}
        aspect={keepRatio ? 'equal' : 'auto'}
        showGrid={showGrid}
        invertColorMap={invertColorMap}
        abscissaParams={{
          label: axisLabels[xDimIndex],
          value: numAxisArrays[xDimIndex],
        }}
        ordinateParams={{
          label: axisLabels[yDimIndex],
          value: numAxisArrays[yDimIndex],
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
