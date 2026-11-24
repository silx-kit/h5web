import {
  type DimensionMapping,
  HeatmapVis,
  KeepZoom,
  useDomain,
  useSafeDomain,
  useSlicedDimsAndMapping,
  useVisDomain,
} from '@h5web/lib';
import {
  type ArrayValue,
  type ComplexType,
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';
import { ComplexVisType } from '@h5web/shared/vis-models';
import { createPortal } from 'react-dom';

import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { type HeatmapConfig } from '../heatmap/config';
import HeatmapToolbar from '../heatmap/HeatmapToolbar';
import { useMappedArray, useToNumArrays } from '../hooks';
import { DEFAULT_DOMAIN } from '../utils';
import { usePhaseAmplitude } from './hooks';
import { COMPLEX_VIS_TYPE_LABELS } from './utils';

interface Props {
  value: ArrayValue<ComplexType>;
  dims: number[];
  dimMapping: DimensionMapping;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<ArrayValue<NumericType>>;
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
  config: HeatmapConfig;
}

function MappedComplexHeatmapVis(props: Props) {
  const {
    value,
    dims,
    dimMapping,
    axisLabels = [],
    axisValues = [],
    title,
    toolbarContainer,
    config,
  } = props;

  const {
    customDomain,
    colorMap,
    scaleType,
    complexVisType,
    flipXAxis,
    flipYAxis,
    keepRatio,
    showGrid,
    invertColorMap,
  } = config;

  const { phase, amplitude } = usePhaseAmplitude(value);
  const numAxisArrays = useToNumArrays(axisValues);

  const mappingArgs = useSlicedDimsAndMapping(dims, dimMapping);
  const phaseArray = useMappedArray(phase, ...mappingArgs);
  const amplitudeArray = useMappedArray(amplitude, ...mappingArgs);

  const phaseDomain = useDomain(phase, { scaleType }) || DEFAULT_DOMAIN;
  const amplitudeDomain = useDomain(amplitude, { scaleType }) || DEFAULT_DOMAIN;

  const [dataArray, dataDomain] =
    complexVisType !== ComplexVisType.Amplitude
      ? [phaseArray, phaseDomain]
      : [amplitudeArray, amplitudeDomain];

  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, scaleType);

  const xDimIndex = dimMapping.indexOf('x');
  const yDimIndex = dimMapping.indexOf('y');

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <HeatmapToolbar dataDomain={dataDomain} isComplex config={config} />,
          toolbarContainer,
        )}

      <HeatmapVis
        className={visualizerStyles.vis}
        dataArray={dataArray}
        domain={safeDomain}
        title={`${title} (${COMPLEX_VIS_TYPE_LABELS[complexVisType].toLowerCase()})`}
        colorMap={colorMap}
        scaleType={scaleType}
        aspect={keepRatio ? 'equal' : 'auto'}
        showGrid={showGrid}
        invertColorMap={invertColorMap}
        flipXAxis={flipXAxis}
        flipYAxis={flipYAxis}
        abscissaParams={{
          label: axisLabels[xDimIndex],
          value: numAxisArrays[xDimIndex],
        }}
        ordinateParams={{
          label: axisLabels[yDimIndex],
          value: numAxisArrays[yDimIndex],
        }}
        alpha={
          complexVisType === ComplexVisType.PhaseAmplitude
            ? {
                array: amplitudeArray,
                domain: amplitudeDomain,
              }
            : undefined
        }
      >
        <KeepZoom visKey="heatmap" />
      </HeatmapVis>
    </>
  );
}

export default MappedComplexHeatmapVis;
