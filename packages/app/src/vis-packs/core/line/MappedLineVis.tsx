import { LineVis } from '@h5web/lib';
import type { AnyArray, ScaleType } from '@h5web/shared';
import { useEffect } from 'react';
import shallow from 'zustand/shallow';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import {
  useCombinedDomain,
  useMappedArrays,
  useMappedArray,
  useDomain,
  useDomains,
} from '../hooks';
import type { AxisMapping } from '../models';
import { useLineConfig } from './config';

type HookArgs = [number[], DimensionMapping, boolean];

interface Props {
  value: AnyArray<number>;
  valueLabel?: string;
  valueScaleType?: ScaleType;
  errors?: AnyArray<number>;
  auxiliaries?: AnyArray<number>[];
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title: string;
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
  } = props;

  const {
    yScaleType,
    setYScaleType,
    xScaleType,
    setXScaleType,
    curveType,
    showGrid,
    autoScale,
    disableAutoScale,
    showErrors,
    disableErrors,
  } = useLineConfig((state) => state, shallow);

  const hookArgs: HookArgs = [dims, dimMapping, autoScale];
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
  useEffect(() => {
    if (mappedAbscissaParams?.scaleType) {
      setXScaleType(mappedAbscissaParams?.scaleType);
    }
  }, [mappedAbscissaParams?.scaleType, setXScaleType]);

  useEffect(() => {
    if (valueScaleType) {
      setYScaleType(valueScaleType);
    }
  }, [setYScaleType, valueScaleType]);

  useEffect(() => {
    disableErrors(!errors);
  }, [disableErrors, errors]);

  useEffect(() => {
    // Disable `autoScale` for 1D datasets (baseArray and dataArray are the same)
    disableAutoScale(dims.length <= 1);
  }, [dims, disableAutoScale]);

  return (
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
      errorsArray={errorArray}
      showErrors={showErrors}
      auxArrays={auxArrays}
    />
  );
}

export default MappedLineVis;
