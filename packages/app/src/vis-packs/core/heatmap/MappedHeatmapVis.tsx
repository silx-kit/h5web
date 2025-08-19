import {
  ComplexVisType,
  type DimensionMapping,
  getSliceSelection,
  HeatmapVis,
  type IgnoreValue,
  useDomain,
  useSafeDomain,
  useSlicedDimsAndMapping,
  useVisDomain,
} from '@h5web/lib';
import { isComplexType } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type ArrayValue,
  type ComplexType,
  type Dataset,
  type NumericLikeType,
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';
import { createPortal } from 'react-dom';

import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import {
  useExportEntries,
  useMappedArray,
  useToNumArray,
  useToNumArrays,
} from '../hooks';
import {
  COMPLEX_VIS_TYPE_LABELS,
  DEFAULT_DOMAIN,
  formatNumLikeType,
} from '../utils';
import { type HeatmapConfig } from './config';
import HeatmapToolbar from './HeatmapToolbar';

interface Props {
  dataset: Dataset<ArrayShape, NumericLikeType | ComplexType>;
  value: ArrayValue<NumericLikeType | ComplexType>;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<ArrayValue<NumericType>>;
  dimMapping: DimensionMapping;
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
  config: HeatmapConfig;
  ignoreValue?: IgnoreValue;
}

function MappedHeatmapVis(props: Props) {
  const {
    dataset,
    value,
    dimMapping,
    axisLabels = [],
    axisValues = [],
    title,
    toolbarContainer,
    config,
    ignoreValue,
  } = props;

  const {
    customDomain,
    colorMap,
    scaleType,
    complexVisType,
    keepRatio,
    showGrid,
    invertColorMap,
    flipXAxis,
    flipYAxis,
  } = config;

  const { shape: dims, type } = dataset;
  const isComplex = isComplexType(type);

  // If complex dataset displayed as phase/amplitude: `numArray` = amplitude; `alphaArray` = phase
  const isPhaseAmp = complexVisType === ComplexVisType.PhaseAmplitude;

  const numArray = useToNumArray(
    value,
    isPhaseAmp ? ComplexVisType.Amplitude : complexVisType,
  );
  const phaseArray = useToNumArray(
    isComplex && isPhaseAmp ? value : undefined,
    ComplexVisType.Phase,
  );

  const numAxisArrays = useToNumArrays(axisValues);

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const dataArray = useMappedArray(numArray, slicedDims, slicedMapping);
  const alphaArray = useMappedArray(phaseArray, slicedDims, slicedMapping);

  const dataDomain =
    useDomain(dataArray, scaleType, undefined, ignoreValue) || DEFAULT_DOMAIN;
  const alphaDomain = useDomain(alphaArray, scaleType) || DEFAULT_DOMAIN;

  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, scaleType);

  const selection = getSliceSelection(dimMapping);
  const xDimIndex = dimMapping.indexOf('x');
  const yDimIndex = dimMapping.indexOf('y');

  const exportEntries = useExportEntries(['tiff', 'npy'], dataset, selection);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <HeatmapToolbar
            dataDomain={dataDomain}
            isSlice={selection !== undefined}
            withComplexSelector={isComplex}
            config={config}
            exportEntries={exportEntries}
          />,
          toolbarContainer,
        )}

      <HeatmapVis
        className={visualizerStyles.vis}
        dataArray={dataArray}
        title={`${title}${isComplex ? ` (${COMPLEX_VIS_TYPE_LABELS[complexVisType].toLowerCase()})` : ''}`}
        dtype={!isComplex ? formatNumLikeType(type) : undefined}
        domain={safeDomain}
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
        flipXAxis={flipXAxis}
        flipYAxis={flipYAxis}
        ignoreValue={ignoreValue}
        alpha={
          alphaArray ? { array: alphaArray, domain: alphaDomain } : undefined
        }
      />
    </>
  );
}

export default MappedHeatmapVis;
