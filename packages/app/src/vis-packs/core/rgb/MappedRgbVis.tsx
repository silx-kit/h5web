import { RgbVis } from '@h5web/lib';
import type { NumArrayDataset } from '@h5web/shared/hdf5-models';
import type { AxisMapping } from '@h5web/shared/nexus-models';
import type { NumArray } from '@h5web/shared/vis-models';
import type { TypedArray } from 'ndarray';
import { createPortal } from 'react-dom';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import type { RgbVisConfig } from './config';
import RgbToolbar from './RgbToolbar';

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

  const { showGrid, keepRatio, imageType, flipXAxis, flipYAxis } = config;
  const { shape: dims } = dataset;

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const [dataArray] = useMappedArray(value, slicedDims, slicedMapping);

  const xDimIndex = dimMapping.indexOf('x');
  const yDimIndex = dimMapping.indexOf('y');

  return (
    <>
      {toolbarContainer &&
        createPortal(<RgbToolbar config={config} />, toolbarContainer)}
      <RgbVis
        className={visualizerStyles.vis}
        dataArray={dataArray}
        title={title}
        showGrid={showGrid}
        aspect={keepRatio ? 'equal' : 'auto'}
        imageType={imageType}
        abscissaParams={{
          label: axisLabels?.[xDimIndex],
          value: axisValues?.[xDimIndex],
        }}
        ordinateParams={{
          label: axisLabels?.[yDimIndex],
          value: axisValues?.[yDimIndex],
        }}
        flipXAxis={flipXAxis}
        flipYAxis={flipYAxis}
      />
    </>
  );
}

export default MappedRgbVis;
