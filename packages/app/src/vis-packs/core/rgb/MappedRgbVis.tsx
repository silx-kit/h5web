import { RgbVis } from '@h5web/lib';
import type { AxisMapping, NumArray, NumArrayDataset } from '@h5web/shared';
import type { TypedArray } from 'ndarray';
import { createPortal } from 'react-dom';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import RgbToolbar from './RgbToolbar';
import type { RgbVisConfig } from './config';

interface Props {
  dataset: NumArrayDataset;
  value: number[] | TypedArray;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<NumArray>;
  dimMapping: DimensionMapping;
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
  config: RgbVisConfig;
}

function MappedRgbVis(props: Props) {
  const {
    dataset,
    value,
    axisLabels,
    axisValues,
    dimMapping,
    title,
    toolbarContainer,
    config,
  } = props;

  const { showGrid, layout, imageType } = config;
  const { shape: dims } = dataset;

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const [dataArray] = useMappedArray(value, slicedDims, slicedMapping);

  const xDimIndex = dimMapping.indexOf('x');
  const yDimIndex = dimMapping.indexOf('y');

  return (
    <>
      {toolbarContainer && createPortal(<RgbToolbar />, toolbarContainer)}
      <RgbVis
        dataArray={dataArray}
        title={title}
        showGrid={showGrid}
        layout={layout}
        imageType={imageType}
        abscissaParams={{
          label: axisLabels?.[xDimIndex],
          value: axisValues?.[xDimIndex],
        }}
        ordinateParams={{
          label: axisLabels?.[yDimIndex],
          value: axisValues?.[yDimIndex],
        }}
      />
    </>
  );
}

export default MappedRgbVis;
