import { ReactElement, useEffect } from 'react';
import type { HDF5Value } from '../../../providers/hdf5-models';
import LineVis from './LineVis';
import { assertArray } from '../../../guards';
import { useMappedArray, useDomain, useBaseArray } from '../hooks';
import { useLineConfig } from './config';
import type { AxisMapping, ScaleType } from '../models';
import type { DimensionMapping } from '../../../dimension-mapper/models';

interface Props {
  value: HDF5Value;
  valueLabel?: string;
  valueScaleType?: ScaleType;
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title?: string;
  errors?: number[];
  showErrors?: boolean;
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
