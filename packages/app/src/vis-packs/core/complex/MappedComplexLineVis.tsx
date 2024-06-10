import { LineVis, useDomain, useSafeDomain, useVisDomain } from '@h5web/lib';
import type { H5WebComplex } from '@h5web/shared/hdf5-models';
import type { AxisMapping } from '@h5web/shared/nexus-models';
import type { NumArray } from '@h5web/shared/vis-models';
import { ComplexVisType } from '@h5web/shared/vis-models';
import { useMemo } from 'react';
import { createPortal } from 'react-dom';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useMappedArray, useSlicedDimsAndMapping } from '../hooks';
import type { LineConfig } from '../line/config';
import { DEFAULT_DOMAIN } from '../utils';
import ComplexLineToolbar from './ComplexLineToolbar';
import type { ComplexLineConfig } from './lineConfig';
import { COMPLEX_VIS_TYPE_LABELS, getPhaseAmplitudeValues } from './utils';

interface Props {
  value: H5WebComplex[];
  valueLabel?: string;
  dims: number[];
  dimMapping: DimensionMapping;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<NumArray>;
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
  config: ComplexLineConfig;
  lineConfig: LineConfig;
}

function MappedComplexLineVis(props: Props) {
  const {
    value,
    valueLabel,
    dims,
    dimMapping,
    axisLabels,
    axisValues,
    title,
    toolbarContainer,
    config,
    lineConfig,
  } = props;

  const { visType } = config;
  const { customDomain, yScaleType, xScaleType, curveType, showGrid } =
    lineConfig;

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const { phaseValues, amplitudeValues } = useMemo(
    () => getPhaseAmplitudeValues(value),
    [value],
  );

  const [dataArray, dataForDomain] = useMappedArray(
    visType === ComplexVisType.Amplitude ? amplitudeValues : phaseValues,
    slicedDims,
    slicedMapping,
  );

  const dataDomain = useDomain(dataForDomain, yScaleType) || DEFAULT_DOMAIN;
  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, yScaleType);

  const xDimIndex = dimMapping.indexOf('x');
  const ordinateLabel = valueLabel
    ? `${valueLabel} (${COMPLEX_VIS_TYPE_LABELS[visType].toLowerCase()})`
    : COMPLEX_VIS_TYPE_LABELS[visType];

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <ComplexLineToolbar
            dataDomain={dataDomain}
            config={config}
            lineConfig={lineConfig}
          />,
          toolbarContainer,
        )}

      <LineVis
        className={visualizerStyles.vis}
        dataArray={dataArray}
        domain={safeDomain}
        scaleType={yScaleType}
        curveType={curveType}
        showGrid={showGrid}
        abscissaParams={{
          label: axisLabels?.[xDimIndex],
          value: axisValues?.[xDimIndex],
          scaleType: xScaleType,
        }}
        ordinateLabel={ordinateLabel}
        title={title}
        testid={dimMapping.toString()}
      />
    </>
  );
}

export default MappedComplexLineVis;
