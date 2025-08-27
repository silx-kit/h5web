import {
  type DimensionMapping,
  RgbVis,
  useSlicedDimsAndMapping,
} from '@h5web/lib';
import {
  type ArrayShape,
  type ArrayValue,
  type Dataset,
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';
import { createPortal } from 'react-dom';

import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useMappedArray, useToNumArray, useToNumArrays } from '../hooks';
import { type RgbVisConfig } from './config';
import RgbToolbar from './RgbToolbar';

interface Props {
  dataset: Dataset<ArrayShape, NumericType>;
  value: ArrayValue<NumericType>;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<ArrayValue<NumericType>>;
  dimMapping: DimensionMapping;
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
  config: RgbVisConfig;
}

function MappedRgbVis(props: Props) {
  const {
    dataset,
    value,
    axisLabels = [],
    axisValues = [],
    dimMapping,
    title,
    toolbarContainer,
    config,
  } = props;

  const { showGrid, keepRatio, imageType, flipXAxis, flipYAxis } = config;

  const numArray = useToNumArray(value);
  const numAxisArrays = useToNumArrays(axisValues);

  const { shape: dims } = dataset;
  const mappingArgs = useSlicedDimsAndMapping(dims, dimMapping);
  const dataArray = useMappedArray(numArray, ...mappingArgs);

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
          label: axisLabels[xDimIndex],
          value: numAxisArrays[xDimIndex],
        }}
        ordinateParams={{
          label: axisLabels[yDimIndex],
          value: numAxisArrays[yDimIndex],
        }}
        flipXAxis={flipXAxis}
        flipYAxis={flipYAxis}
      />
    </>
  );
}

export default MappedRgbVis;
