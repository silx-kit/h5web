import {
  type DimensionMapping,
  getSliceSelection,
  HeatmapVis,
  KeepZoom,
  SurfaceVis,
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
import { useIgnoreValue } from '../../netcdf/hooks';
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
    surface,
    heightScale,
  } = config;

  const ignoreValue = useIgnoreValue(dataset);

  const numArray = useToNumArray(value);
  const numAxisArrays = useToNumArrays(axisValues);

  const { dims } = dataset.shape;
  const mappingArgs = useSlicedDimsAndMapping(dims, dimMapping);
  const dataArray = useMappedArray(numArray, ...mappingArgs);

  const dataDomain =
    useDomain(dataArray, { scaleType, ignoreValue }) || DEFAULT_DOMAIN;
  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, scaleType);

  const selection = getSliceSelection(dimMapping);
  const xDimIndex = dimMapping.indexOf('x');
  const yDimIndex = dimMapping.indexOf('y');

  const visProps = {
    className: visualizerStyles.vis,
    dataArray,
    title,
    domain: safeDomain,
    colorMap,
    scaleType,
    invertColorMap,
    abscissaParams: {
      label: axisLabels[xDimIndex],
      value: numAxisArrays[xDimIndex],
    },
    ordinateParams: {
      label: axisLabels[yDimIndex],
      value: numAxisArrays[yDimIndex],
    },
    flipXAxis,
    flipYAxis,
    ignoreValue,
  };

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

      {surface ? (
        <SurfaceVis
          {...visProps}
          valueLabel={title}
          keepRatio={keepRatio}
          showGrid={showGrid}
          heightScale={heightScale}
        />
      ) : (
        <HeatmapVis
          {...visProps}
          dtype={formatNumLikeType(dataset.type)}
          aspect={keepRatio ? 'equal' : 'auto'}
          showGrid={showGrid}
        >
          <KeepZoom visKey="heatmap" />
        </HeatmapVis>
      )}
    </>
  );
}

export default MappedHeatmapVis;
