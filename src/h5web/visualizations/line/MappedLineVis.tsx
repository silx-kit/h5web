import React, { ReactElement, useEffect, useMemo } from 'react';
import type { HDF5Value } from '../../providers/models';
import type { DimensionMapping } from '../../dimension-mapper/models';
import LineVis from './LineVis';
import { assertArray } from '../shared/utils';
import { useMappedArray, useDomain, useBaseArray } from '../shared/hooks';
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

  const baseArray = useBaseArray(value, dims);
  const dataArray = useMappedArray(baseArray, dimensionMapping);

  // Disable `autoScale` for 1D datasets (baseArray and dataArray are the same)
  useEffect(() => {
    disableAutoScale(!baseArray.shape || baseArray.shape.length <= 1);
  }, [baseArray.shape, disableAutoScale]);

  const dataWithErrors = useMemo(() => {
    const data = (autoScale ? dataArray.data : baseArray.data) as number[];

    if (!errors) {
      return data;
    }

    return data.flatMap((value, i) => [
      value - errors[i],
      value,
      value + errors[i],
    ]);
  }, [autoScale, baseArray.data, dataArray.data, errors]);

  const dataDomain = useDomain(dataWithErrors, yScaleType);
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
      errors={errors}
    />
  );
}

export default MappedLineVis;
