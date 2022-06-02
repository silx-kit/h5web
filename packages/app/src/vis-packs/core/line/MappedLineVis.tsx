import { LineVis, useCombinedDomain, useDomain, useDomains } from '@h5web/lib';
import type {
  ArrayShape,
  Dataset,
  NumArray,
  NumericType,
  ScaleType,
} from '@h5web/shared';
import { createPortal } from 'react-dom';
import shallow from 'zustand/shallow';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import type { Auxiliary } from '../../nexus/models';
import {
  useMappedArrays,
  useMappedArray,
  useSlicedDimsAndMapping,
} from '../hooks';
import type { AxisMapping } from '../models';
import LineToolbar from './LineToolbar';
import { useLineConfig } from './config';

type HookArgs = [number[], DimensionMapping, boolean];

interface Props {
  dataset?: Dataset<ArrayShape, NumericType>;
  selection?: string | undefined;
  value: NumArray;
  valueLabel?: string;
  valueScaleType?: ScaleType;
  errors?: NumArray;
  auxiliaries?: Auxiliary[];
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title: string;
  toolbarContainer?: HTMLDivElement | undefined;
}

function MappedLineVis(props: Props) {
  const {
    dataset,
    selection,
    value,
    valueLabel,
    valueScaleType,
    errors,
    auxiliaries = [],
    dims,
    dimMapping,
    axisMapping = [],
    title,
    toolbarContainer,
  } = props;

  const { yScaleType, xScaleType, curveType, showGrid, autoScale, showErrors } =
    useLineConfig((state) => state, shallow);

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

  const mappedAbscissaParams = axisMapping[dimMapping.indexOf('x')];

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <LineToolbar
            dataset={dataset}
            selection={selection}
            initialXScaleType={mappedAbscissaParams?.scaleType}
            initialYScaleType={valueScaleType}
            disableAutoScale={dims.length <= 1} // with 1D datasets, `baseArray` and `dataArray` are the same so auto-scaling is implied
            disableErrors={!errors}
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
          label: mappedAbscissaParams?.label,
          value: mappedAbscissaParams?.value,
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
        testid={dimMapping.toString()}
      />
    </>
  );
}

export default MappedLineVis;
