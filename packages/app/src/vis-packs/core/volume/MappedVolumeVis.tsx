import { useDomain, useSafeDomain, useVisDomain, VolumeVis } from '@h5web/lib';
import {
  type ArrayShape,
  type ArrayValue,
  type Dataset,
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { createPortal } from 'react-dom';

import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useIgnoreValue } from '../../netcdf/hooks';
import { useBaseArray, useToNumArray } from '../hooks';
import { DEFAULT_DOMAIN } from '../utils';
import { type VolumeConfig } from './config';
import VolumeToolbar from './VolumeToolbar';

interface Props {
  dataset: Dataset<ArrayShape, NumericType>;
  value: ArrayValue<NumericType>;
  toolbarContainer: HTMLDivElement | undefined;
  config: VolumeConfig;
}

function MappedVolumeVis(props: Props) {
  const { dataset, value, toolbarContainer, config } = props;
  const {
    customDomain,
    colorMap,
    scaleType,
    invertColorMap,
    mode,
    opacity,
    threshold,
    quality,
  } = config;

  const numArray = useToNumArray(value);
  const dataArray = useBaseArray(numArray, dataset.shape.dims);

  const ignoreValue = useIgnoreValue(dataset);
  const dataDomain =
    useDomain(dataArray, { scaleType, ignoreValue }) || DEFAULT_DOMAIN;
  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, scaleType);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <VolumeToolbar dataDomain={dataDomain} config={config} />,
          toolbarContainer,
        )}

      <VolumeVis
        className={visualizerStyles.vis}
        dataArray={dataArray}
        domain={safeDomain}
        colorMap={colorMap}
        scaleType={scaleType}
        invertColorMap={invertColorMap}
        mode={mode}
        opacity={opacity}
        threshold={threshold}
        quality={quality}
      />
    </>
  );
}

export default MappedVolumeVis;
