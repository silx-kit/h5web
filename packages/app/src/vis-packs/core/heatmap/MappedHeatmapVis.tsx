import { HeatmapVis } from '@h5web/lib';
import type {
  ArrayShape,
  Dataset,
  NumericType,
  ScaleType,
} from '@h5web/shared';
import type { TypedArray } from 'ndarray';
import { createPortal } from 'react-dom';
import shallow from 'zustand/shallow';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useDomain, useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import type { AxisMapping } from '../models';
import { DEFAULT_DOMAIN } from '../utils';
import HeatmapToolbar from './HeatmapToolbar';
import { useHeatmapConfig } from './config';
import { useSafeDomain, useVisDomain } from './hooks';

interface Props {
  dataset: Dataset<ArrayShape, NumericType>;
  selection: string | undefined;
  value: number[] | TypedArray;
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title: string;
  colorScaleType?: ScaleType;
  toolbarContainer: HTMLDivElement | undefined;
}

function MappedHeatmapVis(props: Props) {
  const {
    dataset,
    selection,
    value,
    dims,
    dimMapping,
    axisMapping = [],
    title,
    colorScaleType,
    toolbarContainer,
  } = props;

  const {
    customDomain,
    colorMap,
    scaleType,
    layout,
    showGrid,
    invertColorMap,
    flipYAxis,
  } = useHeatmapConfig((state) => state, shallow);

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const [dataArray] = useMappedArray(value, slicedDims, slicedMapping);

  const dataDomain = useDomain(dataArray, scaleType) || DEFAULT_DOMAIN;
  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, scaleType);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <HeatmapToolbar
            dataset={dataset}
            dataDomain={dataDomain}
            selection={selection}
            initialScaleType={colorScaleType}
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
        abscissaParams={axisMapping[dimMapping.indexOf('x')]}
        ordinateParams={axisMapping[dimMapping.indexOf('y')]}
        flipYAxis={flipYAxis}
      />
    </>
  );
}

export default MappedHeatmapVis;
