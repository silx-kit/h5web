import { ScatterVis, useDomain, useSafeDomain, useVisDomain } from '@h5web/lib';
import { toArray } from '@h5web/lib/src/vis/utils';
import type { NumArray, ScaleType } from '@h5web/shared';
import { assertDefined } from '@h5web/shared';
import { createPortal } from 'react-dom';
import shallow from 'zustand/shallow';

import { useBaseArray } from '../hooks';
import type { AxisMapping } from '../models';
import { DEFAULT_DOMAIN } from '../utils';
import ScatterToolbar from './ScatterToolbar';
import { useScatterConfig } from './config';

interface Props {
  value: NumArray;
  axisMapping: AxisMapping;
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
  colorScaleType?: ScaleType;
}

function MappedScatterVis(props: Props) {
  const { value, axisMapping, title, toolbarContainer, colorScaleType } = props;

  const [xAxis, yAxis] = axisMapping;

  assertDefined(xAxis?.value);
  assertDefined(yAxis?.value);

  const { showGrid, colorMap, invertColorMap, scaleType, customDomain } =
    useScatterConfig((state) => state, shallow);
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
          />,
          toolbarContainer
        )}
      <ScatterVis
        dataAbscissas={toArray(xAxis.value)}
        dataOrdinates={toArray(yAxis.value)}
        dataArray={dataArray}
        domain={safeDomain}
        colorMap={colorMap}
        invertColorMap={invertColorMap}
        abscissaLabel={xAxis.label}
        ordinateLabel={yAxis.label}
        scaleType={scaleType}
        showGrid={showGrid}
        title={title}
      />
    </>
  );
}

export default MappedScatterVis;
