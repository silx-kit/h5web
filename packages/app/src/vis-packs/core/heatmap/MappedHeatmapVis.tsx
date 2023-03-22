import { HeatmapVis, useDomain, useSafeDomain, useVisDomain } from '@h5web/lib';
import type { AxisMapping, NumArray, NumArrayDataset } from '@h5web/shared';
import type { TypedArray } from 'ndarray';
import { createPortal } from 'react-dom';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useDataContext } from '../../../providers/DataProvider';
import {
  useIgnoreFillValue,
  useMappedArray,
  useSlicedDimsAndMapping,
} from '../hooks';
import { DEFAULT_DOMAIN, getSliceSelection } from '../utils';
import HeatmapToolbar from './HeatmapToolbar';
import type { HeatmapConfig } from './config';

interface Props {
  dataset: NumArrayDataset;
  value: number[] | TypedArray;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<NumArray>;
  dimMapping: DimensionMapping;
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
  config: HeatmapConfig;
  fillValue?: number;
}

function MappedHeatmapVis(props: Props) {
  const {
    dataset,
    value,
    dimMapping,
    axisLabels,
    axisValues,
    title,
    toolbarContainer,
    config,
    fillValue,
  } = props;

  const {
    customDomain,
    colorMap,
    scaleType,
    keepRatio,
    showGrid,
    invertColorMap,
    flipYAxis,
  } = config;

  const { shape: dims } = dataset;
  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const [dataArray] = useMappedArray(value, slicedDims, slicedMapping);

  const ignoreValue = useIgnoreFillValue(fillValue);
  const dataDomain =
    useDomain(dataArray, scaleType, undefined, ignoreValue) || DEFAULT_DOMAIN;
  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, scaleType);

  const xDimIndex = dimMapping.indexOf('x');
  const yDimIndex = dimMapping.indexOf('y');

  const { getExportURL } = useDataContext();
  const selection = getSliceSelection(dimMapping);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <HeatmapToolbar
            dataDomain={dataDomain}
            isSlice={selection !== undefined}
            config={config}
            getExportURL={
              getExportURL &&
              ((format) => getExportURL(format, dataset, selection, value))
            }
          />,
          toolbarContainer
        )}

      <HeatmapVis
        dataArray={dataArray}
        title={title}
        dtype={dataset.type}
        domain={safeDomain}
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
        flipYAxis={flipYAxis}
        fillValue={fillValue}
      />
    </>
  );
}

export default MappedHeatmapVis;
