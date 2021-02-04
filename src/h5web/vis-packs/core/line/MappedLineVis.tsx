import { ReactElement, useEffect } from 'react';
import LineVis from './LineVis';
import { useMappedArray, useDomain, useBaseArray } from '../hooks';
import { useLineConfig } from './config';
import type { AxisMapping, ScaleType } from '../models';
import type { DimensionMapping } from '../../../dimension-mapper/models';

interface Props {
  value: number[];
  valueLabel?: string;
  valueScaleType?: ScaleType;
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title?: string;
  errors?: number[];
}

function MappedLineVis(props: Props): ReactElement {
  const {
    value,
    valueLabel,
    valueScaleType,
    dims,
    dimMapping,
    axisMapping = [],
    title,
    errors,
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
  } = useLineConfig();

  const baseDataArray = useBaseArray(value, dims);
  const dataArray = useMappedArray(baseDataArray, dimMapping);

  const baseErrorsArray = useBaseArray(errors, dims);
  const errorArray = useMappedArray(baseErrorsArray, dimMapping);

  useEffect(() => {
    // Disable `autoScale` for 1D datasets without errors
    disableAutoScale(baseDataArray.shape.length <= 1 && !errors);
  }, [baseDataArray.shape, disableAutoScale, errors]);

  const dataValues = (autoScale ? dataArray : baseDataArray).data as number[];
  const errorValues = autoScale
    ? errorArray && (errorArray.data as number[])
    : baseErrorsArray && (baseErrorsArray.data as number[]);

  const dataDomain = useDomain(
    dataValues,
    yScaleType,
    showErrors || !autoScale ? errorValues : undefined
  );

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
      errorsArray={errorArray}
      showErrors={showErrors}
    />
  );
}

export default MappedLineVis;
