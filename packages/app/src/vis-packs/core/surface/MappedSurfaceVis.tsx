import {
  type DimensionMapping,
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
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { createPortal } from 'react-dom';

import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useMappedArray, useToNumArray } from '../hooks';
import { DEFAULT_DOMAIN } from '../utils';
import { type SurfaceConfig } from './config';
import SurfaceToolbar from './SurfaceToolbar';

interface Props {
  dataset: Dataset<ArrayShape, NumericType>;
  value: ArrayValue<NumericType>;
  dimMapping: DimensionMapping;
  toolbarContainer: HTMLDivElement | undefined;
  config: SurfaceConfig;
}

function MappedSurfaceVis(props: Props) {
  const { dataset, value, dimMapping, toolbarContainer, config } = props;

  const { customDomain, colorMap, scaleType, invertColorMap } = config;

  const { shape: dims } = dataset;
  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);

  const numArray = useToNumArray(value);
  const dataArray = useMappedArray(numArray, slicedDims, slicedMapping);

  const dataDomain = useDomain(dataArray, scaleType) || DEFAULT_DOMAIN;
  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, scaleType);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <SurfaceToolbar dataDomain={dataDomain} config={config} />,
          toolbarContainer,
        )}

      <SurfaceVis
        className={visualizerStyles.vis}
        dataArray={dataArray}
        domain={safeDomain}
        colorMap={colorMap}
        scaleType={scaleType}
        invertColorMap={invertColorMap}
      />
    </>
  );
}

export default MappedSurfaceVis;
