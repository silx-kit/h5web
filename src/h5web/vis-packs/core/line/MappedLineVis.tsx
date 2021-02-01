import { ReactElement, useEffect } from 'react';
import type { HDF5Value } from '../../../providers/hdf5-models';
import LineVis from './LineVis';
import { assertArray } from '../../../guards';
import { useMappedArray, useDomain, useBaseArray } from '../hooks';
import { useLineConfig } from './config';
import type { AxisMapping, ScaleType } from '../models';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../hooks';

interface Props {
  value: HDF5Value;
  dims: number[];
  valueLabel?: string;
  valueScaleType?: ScaleType;
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
    axisMapping = [],
    dims,
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

  const [dimMapping, setDimMapping] = useDimMappingState(dims, 1);

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
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
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
    </>
  );
}

export default MappedLineVis;
