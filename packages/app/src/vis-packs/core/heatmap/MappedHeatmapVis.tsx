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
import { assertDefined, isComplexType } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type ArrayValue,
  type ComplexType,
  type Dataset,
  type NumericLikeType,
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';
import { useMemo } from 'react';
import { createPortal } from 'react-dom';

import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { COMPLEX_VIS_TYPE_LABELS } from '../complex/utils';
import { useExportEntries, useMappedArray, useToNumArrays } from '../hooks';
import {
  DEFAULT_DOMAIN,
  formatNumLikeType,
  getPhaseAmp,
  isComplexArray,
  toNumArray,
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
  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const isComplex = isComplexArray(value);

  const numArray = useMemo(
    () => (!isComplex ? toNumArray(value) : undefined),
    [isComplex, value],
  );
  const [phaseArray, amplitudeArray] = useMemo(
    () => (isComplex ? getPhaseAmp(value) : []),
    [isComplex, value],
  );

  const numAxisArrays = useToNumArrays(axisValues);

  const hookArgs = [slicedDims, slicedMapping] as const;
  const numMapped = useMappedArray(numArray, ...hookArgs);
  const phaseMapped = useMappedArray(phaseArray, ...hookArgs);
  const amplitudeMapped = useMappedArray(amplitudeArray, ...hookArgs);

  const numDomain =
    useDomain(numMapped, scaleType, undefined, ignoreValue) || DEFAULT_DOMAIN;
  const phaseDomain = useDomain(phaseMapped, scaleType) || DEFAULT_DOMAIN;
  const amplitudeDomain =
    useDomain(amplitudeMapped, scaleType) || DEFAULT_DOMAIN;

  const [dataArray, dataDomain] = numMapped
    ? [numMapped, numDomain]
    : complexVisType === ComplexVisType.Amplitude
      ? [amplitudeMapped, amplitudeDomain]
      : [phaseMapped, phaseDomain];

  assertDefined(dataArray);
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
            isComplex={isComplex}
            config={config}
            exportEntries={exportEntries}
          />,
          toolbarContainer,
        )}

      <HeatmapVis
        className={visualizerStyles.vis}
        dataArray={dataArray}
        title={`${title}${isComplex ? ` (${COMPLEX_VIS_TYPE_LABELS[complexVisType].toLowerCase()})` : ''}`}
        dtype={!isComplexType(type) ? formatNumLikeType(type) : undefined}
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
        ignoreValue={!isComplex ? ignoreValue : undefined}
        alpha={
          amplitudeMapped && complexVisType === ComplexVisType.PhaseAmplitude
            ? { array: amplitudeMapped, domain: amplitudeDomain }
            : undefined
        }
      />
    </>
  );
}

export default MappedHeatmapVis;
