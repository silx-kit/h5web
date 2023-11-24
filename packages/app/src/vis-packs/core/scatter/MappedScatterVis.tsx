import { ScatterVis, useDomain, useSafeDomain, useVisDomain } from '@h5web/lib';
import { assertDefined } from '@h5web/shared/guards';
import type { AxisMapping } from '@h5web/shared/models-nexus';
import type { NumArray } from '@h5web/shared/models-vis';
import { createPortal } from 'react-dom';

import { useBaseArray } from '../hooks';
import { DEFAULT_DOMAIN } from '../utils';
import type { ScatterConfig } from './config';
import ScatterToolbar from './ScatterToolbar';

interface Props {
  value: NumArray;
  axisLabels: AxisMapping<string>;
  axisValues: AxisMapping<NumArray>;
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
  config: ScatterConfig;
}

function MappedScatterVis(props: Props) {
  const { value, axisLabels, axisValues, title, toolbarContainer, config } =
    props;

  const {
    showGrid,
    colorMap,
    invertColorMap,
    scaleType,
    customDomain,
    xScaleType,
    yScaleType,
  } = config;

  const dataArray = useBaseArray(value, [value.length]);
  const dataDomain = useDomain(dataArray, scaleType) || DEFAULT_DOMAIN;
  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, scaleType);

  const [xLabel, yLabel] = axisLabels;
  const [xValue, yValue] = axisValues;
  assertDefined(xValue);
  assertDefined(yValue);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <ScatterToolbar dataDomain={dataDomain} config={config} />,
          toolbarContainer,
        )}
      <ScatterVis
        abscissaParams={{ label: xLabel, value: xValue, scaleType: xScaleType }}
        ordinateParams={{ label: yLabel, value: yValue, scaleType: yScaleType }}
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
