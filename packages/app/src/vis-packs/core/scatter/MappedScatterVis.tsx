import {
  KeepZoom,
  ScatterVis,
  useDomain,
  useSafeDomain,
  useVisDomain,
} from '@h5web/lib';
import { assertDefined } from '@h5web/shared/guards';
import { type ArrayValue, type NumericType } from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';
import { createPortal } from 'react-dom';

import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useBaseArray, useToNumArray, useToNumArrays } from '../hooks';
import { DEFAULT_DOMAIN } from '../utils';
import { type ScatterConfig } from './config';
import ScatterToolbar from './ScatterToolbar';

interface Props {
  value: ArrayValue<NumericType>;
  axisLabels: AxisMapping<string>;
  axisValues: AxisMapping<ArrayValue<NumericType>>;
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

  const numArray = useToNumArray(value);
  const numAxisArrays = useToNumArrays(axisValues);

  const dataArray = useBaseArray(numArray, [value.length]);
  const dataDomain = useDomain(dataArray, scaleType) || DEFAULT_DOMAIN;
  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, scaleType);

  const [xLabel, yLabel] = axisLabels;
  const [xValue, yValue] = numAxisArrays;
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
        className={visualizerStyles.vis}
        abscissaParams={{ label: xLabel, value: xValue, scaleType: xScaleType }}
        ordinateParams={{ label: yLabel, value: yValue, scaleType: yScaleType }}
        dataArray={dataArray}
        domain={safeDomain}
        colorMap={colorMap}
        invertColorMap={invertColorMap}
        scaleType={scaleType}
        showGrid={showGrid}
        title={title}
      >
        <KeepZoom visKey="scatter" />
      </ScatterVis>
    </>
  );
}

export default MappedScatterVis;
