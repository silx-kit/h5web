import { LineVis } from '@h5web/lib';
import type { NumericType, ScaleType } from '@h5web/shared';
import { createPortal } from 'react-dom';
import shallow from 'zustand/shallow';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import {
  useCombinedDomain,
  useMappedArrays,
  useMappedArray,
  useDomain,
  useDomains,
  useSlicedDimsAndMapping,
} from '../hooks';
import type { AxisMapping } from '../models';
import LineToolbar from './LineToolbar';
import { useLineConfig } from './config';

type HookArgs = [number[], DimensionMapping, boolean];

interface Props {
  value: number[];
  valueLabel?: string;
  valueScaleType?: ScaleType;
  errors?: number[];
  auxiliaries?: number[][];
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title: string;
  dtype?: NumericType;
  toolbarContainer?: HTMLDivElement | undefined;
}

function MappedLineVis(props: Props) {
  const {
    value,
    valueLabel,
    valueScaleType,
    errors,
    auxiliaries = [],
    dims,
    dimMapping,
    axisMapping = [],
    title,
    dtype,
    toolbarContainer,
  } = props;

  const { yScaleType, xScaleType, curveType, showGrid, autoScale, showErrors } =
    useLineConfig((state) => state, shallow);

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);

  const hookArgs: HookArgs = [slicedDims, slicedMapping, autoScale];

  const [dataArray, dataForDomain] = useMappedArray(value, ...hookArgs);
  const [errorArray, errorsForDomain] = useMappedArray(errors, ...hookArgs);
  const [auxArrays, auxForDomain] = useMappedArrays(auxiliaries, ...hookArgs);

  const dataDomain = useDomain(
    dataForDomain,
    yScaleType,
    showErrors ? errorsForDomain : undefined
  );
  const auxDomains = useDomains(auxForDomain, yScaleType);
  const combinedDomain = useCombinedDomain([dataDomain, ...auxDomains]);

  const mappedAbscissaParams = axisMapping[dimMapping.indexOf('x')];

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <LineToolbar
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
        dtype={dtype}
        errorsArray={errorArray}
        showErrors={showErrors}
        auxArrays={auxArrays}
      />
    </>
  );
}

export default MappedLineVis;
