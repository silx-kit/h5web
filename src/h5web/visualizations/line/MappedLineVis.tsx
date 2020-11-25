import React, { ReactElement, useEffect } from 'react';
import type { HDF5Value } from '../../providers/models';
import type { DimensionMapping } from '../../dimension-mapper/models';
import LineVis from './LineVis';
import { assertArray } from '../shared/utils';
import {
  useMappedArray,
  useDomain,
  useBaseArray,
  useDataArrays,
} from '../shared/hooks';
import { useLineConfig } from './config';
import { AxisMapping, ScaleType } from '../shared/models';

interface Props {
  value: HDF5Value;
  dims: number[];
  dimensionMapping: DimensionMapping;
  valueLabel?: string;
  valueScaleType?: ScaleType;
  axisMapping?: AxisMapping[];
  title?: string;
  errors?: number[];
  showErrors?: boolean;
}

function MappedLineVis(props: Props): ReactElement {
  const {
    value,
    valueLabel,
    valueScaleType,
    axisMapping = [],
    dims,
    dimensionMapping,
    title,
    errors,
    showErrors,
  } = props;
  assertArray<number>(value);

  const {
    yScaleType,
    setYScaleType,
    xScaleType,
    setXScaleType,
    curveType,
    showGrid,
    autoScale,
    disableAutoScale,
  } = useLineConfig();

  const { baseArray: baseDataArray, mappedArray: dataArray } = useDataArrays(
    value,
    dims,
    dimensionMapping
  );

  const baseErrorsArray = useBaseArray(errors, dims);
  const errorArray = useMappedArray(baseErrorsArray, dimensionMapping);

  // Disable `autoScale` for 1D datasets (baseArray and dataArray are the same)
  useEffect(() => {
    disableAutoScale(!baseDataArray.shape || baseDataArray.shape.length <= 1);
  }, [baseDataArray.shape, disableAutoScale]);

  const dataValues = (autoScale ? dataArray : baseDataArray).data as number[];
  const errorValues = autoScale
    ? errorArray && (errorArray.data as number[])
    : baseErrorsArray && (baseErrorsArray.data as number[]);
  const dataDomain = useDomain(dataValues, yScaleType, errorValues);

  const mappedAbscissaParams =
    dimensionMapping && axisMapping[dimensionMapping.indexOf('x')];
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

  return (
    <LineVis
      dataArray={dataArray}
      domain={dataDomain}
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
      errors={errorArray && (errorArray.data as number[])}
      showErrors={showErrors}
    />
  );
}

export default MappedLineVis;
