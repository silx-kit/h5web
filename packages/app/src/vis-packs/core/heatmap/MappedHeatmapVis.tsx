import {
  type DimensionMapping,
  getSliceSelection,
  HeatmapVis,
  type IgnoreValue,
  KeepZoom,
  useDomain,
  useSafeDomain,
  useSlicedDimsAndMapping,
  useVisDomain,
} from '@h5web/lib';
import {
  type ArrayShape,
  type ArrayValue,
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
import { DEFAULT_DOMAIN, formatNumLikeType } from '../utils';
import { type HeatmapConfig } from './config';
import HeatmapToolbar from './HeatmapToolbar';

interface Props {
  dataset: Dataset<ArrayShape, NumericLikeType>;
  value: ArrayValue<NumericLikeType>;
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
    keepRatio,
    showGrid,
    invertColorMap,
    flipXAxis,
    flipYAxis,
  } = config;

  const numArray = useToNumArray(value);
  const numAxisArrays = useToNumArrays(axisValues);

  const { shape: dims } = dataset;
  const mappingArgs = useSlicedDimsAndMapping(dims, dimMapping);
  const dataArray = useMappedArray(numArray, ...mappingArgs);

  const dataDomain =
    useDomain(dataArray, { scaleType, ignoreValue }) || DEFAULT_DOMAIN;
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
            config={config}
            exportEntries={exportEntries}
          />,
          toolbarContainer,
        )}

      <HeatmapVis
        className={visualizerStyles.vis}
        dataArray={dataArray}
        title={title}
        dtype={formatNumLikeType(dataset.type)}
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
      >
        <KeepZoom visKey="heatmap" />
      </HeatmapVis>
    </>
  );
}

export default MappedHeatmapVis;
