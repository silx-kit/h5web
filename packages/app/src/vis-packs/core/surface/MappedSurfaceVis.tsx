import { SurfaceVis, useDomain, useSafeDomain, useVisDomain } from '@h5web/lib';
import type { NumArrayDataset } from '@h5web/shared';
import type { TypedArray } from 'ndarray';
import { createPortal } from 'react-dom';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import { DEFAULT_DOMAIN } from '../utils';
import type { SurfaceConfig } from './config';
import SurfaceToolbar from './SurfaceToolbar';

interface Props {
  dataset: NumArrayDataset;
  value: number[] | TypedArray;
  dimMapping: DimensionMapping;
  toolbarContainer: HTMLDivElement | undefined;
  config: SurfaceConfig;
}

function MappedSurfaceVis(props: Props) {
  const { dataset, value, dimMapping, toolbarContainer, config } = props;

  const { customDomain, colorMap, scaleType, invertColorMap } = config;

  const { shape: dims } = dataset;
  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const [dataArray] = useMappedArray(value, slicedDims, slicedMapping);

  const dataDomain = useDomain(dataArray, scaleType) || DEFAULT_DOMAIN;
  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, scaleType);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <SurfaceToolbar dataDomain={dataDomain} config={config} />,
          toolbarContainer
        )}

      <SurfaceVis
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
