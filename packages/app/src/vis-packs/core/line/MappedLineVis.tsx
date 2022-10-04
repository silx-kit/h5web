import { LineVis, useCombinedDomain, useDomain, useDomains } from '@h5web/lib';
import type { ArrayShape, Dataset, NumArray, NumericType } from '@h5web/shared';
import { createPortal } from 'react-dom';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import type { Auxiliary, AxisMapping } from '../../nexus/models';
import {
  useMappedArrays,
  useMappedArray,
  useSlicedDimsAndMapping,
} from '../hooks';
import LineToolbar from './LineToolbar';
import type { LineConfig } from './config';

type HookArgs = [number[], DimensionMapping, boolean];

interface Props {
  dataset?: Dataset<ArrayShape, NumericType>;
  selection?: string | undefined;
  value: NumArray;
  valueLabel?: string;
  errors?: NumArray;
  auxiliaries?: Auxiliary[];
  dims: number[];
  dimMapping: DimensionMapping;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<NumArray>;
  title: string;
  toolbarContainer?: HTMLDivElement | undefined;
  config: LineConfig;
}

function MappedLineVis(props: Props) {
  const {
    dataset,
    selection,
    value,
    valueLabel,
    errors,
    auxiliaries = [],
    dims,
    dimMapping,
    axisLabels,
    axisValues,
    title,
    toolbarContainer,
    config,
  } = props;

  const { yScaleType, xScaleType, curveType, showGrid, autoScale, showErrors } =
    config;

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);

  const hookArgs: HookArgs = autoScale
    ? [slicedDims, slicedMapping, autoScale]
    : [dims, dimMapping, autoScale];

  const [dataArray, dataForDomain] = useMappedArray(value, ...hookArgs);
  const [errorArray, errorsForDomain] = useMappedArray(errors, ...hookArgs);
  const [auxArrays, auxForDomain] = useMappedArrays(
    auxiliaries.map((aux) => aux.values),
    ...hookArgs
  );
  const [auxErrorsArrays, auxErrorsForDomain] = useMappedArrays(
    auxiliaries.map((aux) => aux.errors),
    ...hookArgs
  );

  const dataDomain = useDomain(
    dataForDomain,
    yScaleType,
    showErrors ? errorsForDomain : undefined
  );
  const auxDomains = useDomains(auxForDomain, yScaleType, auxErrorsForDomain);
  const combinedDomain = useCombinedDomain([dataDomain, ...auxDomains]);
  const xDimIndex = dimMapping.indexOf('x');

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <LineToolbar
            dataset={dataset}
            selection={selection}
            disableAutoScale={dims.length <= 1} // with 1D datasets, `baseArray` and `dataArray` are the same so auto-scaling is implied
            disableErrors={!errors}
            config={config}
          />,
          toolbarContainer
        )}

      <LineVis
        dataArray={dataArray}
        domain={combinedDomain}
        scaleType={yScaleType}
        curveType={curveType}
        showGrid={showGrid}
        abscissaParams={{
          label: axisLabels?.[xDimIndex],
          value: axisValues?.[xDimIndex],
          scaleType: xScaleType,
        }}
        ordinateLabel={valueLabel}
        title={title}
        dtype={dataset?.type}
        errorsArray={errorArray}
        showErrors={showErrors}
        auxiliaries={auxiliaries.map(({ label }, i) => ({
          label,
          array: auxArrays[i],
          errors: auxErrorsArrays[i],
        }))}
      />
    </>
  );
}

export default MappedLineVis;
