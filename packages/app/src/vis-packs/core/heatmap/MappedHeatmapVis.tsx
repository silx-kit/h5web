import { HeatmapVis, useDomain, useSafeDomain, useVisDomain } from '@h5web/lib';
import type { ArrayShape, Dataset, NumArray, NumericType } from '@h5web/shared';
import type { TypedArray } from 'ndarray';
import { createPortal } from 'react-dom';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import type { AxisMapping } from '../../nexus/models';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import { DEFAULT_DOMAIN, getSliceSelection } from '../utils';
import HeatmapToolbar from './HeatmapToolbar';
import type { HeatmapConfig } from './config';

interface Props {
  dataset: Dataset<ArrayShape, NumericType>;
  value: number[] | TypedArray;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<NumArray>;
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
    axisLabels,
    axisValues,
    title,
    toolbarContainer,
    config,
  } = props;

  const {
    customDomain,
    colorMap,
    scaleType,
    layout,
    showGrid,
    invertColorMap,
    flipYAxis,
  } = config;

  const { shape: dims } = dataset;
  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const [dataArray] = useMappedArray(value, slicedDims, slicedMapping);

  const dataDomain = useDomain(dataArray, scaleType) || DEFAULT_DOMAIN;
  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, scaleType);

  const xDimIndex = dimMapping.indexOf('x');
  const yDimIndex = dimMapping.indexOf('y');

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <HeatmapToolbar
            dataset={dataset}
            dataDomain={dataDomain}
            selection={getSliceSelection(dimMapping)}
            config={config}
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
        layout={layout}
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
      />
    </>
  );
}

export default MappedHeatmapVis;
