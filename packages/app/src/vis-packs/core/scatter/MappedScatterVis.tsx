import { ScatterVis, useDomain, useSafeDomain, useVisDomain } from '@h5web/lib';
import type { ScatterAxisParams } from '@h5web/lib/src/vis/scatter/models';
import type { NumArray, ScaleType } from '@h5web/shared';
import { createPortal } from 'react-dom';
import shallow from 'zustand/shallow';

import { useBaseArray } from '../hooks';
import { DEFAULT_DOMAIN } from '../utils';
import ScatterToolbar from './ScatterToolbar';
import { useScatterConfig } from './config';

interface Props {
  value: NumArray;
  abscissaParams: ScatterAxisParams;
  ordinateParams: ScatterAxisParams;
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
  colorScaleType?: ScaleType;
}

function MappedScatterVis(props: Props) {
  const {
    value,
    abscissaParams,
    ordinateParams,
    title,
    toolbarContainer,
    colorScaleType,
  } = props;

  const {
    showGrid,
    colorMap,
    invertColorMap,
    scaleType,
    customDomain,
    xScaleType,
    yScaleType,
  } = useScatterConfig((state) => state, shallow);
  const dataArray = useBaseArray(value, [value.length]);

  const dataDomain = useDomain(dataArray, scaleType) || DEFAULT_DOMAIN;
  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, scaleType);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <ScatterToolbar
            dataDomain={dataDomain}
            initialScaleType={colorScaleType}
            initialXScaleType={abscissaParams.scaleType}
            initialYScaleType={ordinateParams.scaleType}
          />,
          toolbarContainer
        )}
      <ScatterVis
        abscissaParams={{ ...abscissaParams, scaleType: xScaleType }}
        ordinateParams={{ ...ordinateParams, scaleType: yScaleType }}
        dataArray={dataArray}
        domain={safeDomain}
        colorMap={colorMap}
        invertColorMap={invertColorMap}
        scaleType={scaleType}
        showGrid={showGrid}
        title={title}
      />
    </>
  );
}

export default MappedScatterVis;
