import { ReactElement, useEffect, useState } from 'react';
import type { HDF5Value } from '../../providers/hdf5-models';
import type { DimensionMapping } from '../../dimension-mapper/models';
import LineVis from './LineVis';
import { assertArray } from '../../guards';
import { useMappedArray, useDomain, useBaseArray } from '../shared/hooks';
import { useLineConfig } from './config';
import type { AxisMapping, ScaleType } from '../shared/models';
import DimensionMapper from '../../dimension-mapper/DimensionMapper';

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

  const [dimensionMapping, setDimensionMapping] = useState<DimensionMapping>([
    ...new Array(dims.length - 1).fill(0),
    'x',
  ]);

  const baseDataArray = useBaseArray(value, dims);
  const dataArray = useMappedArray(baseDataArray, dimensionMapping);

  const baseErrorsArray = useBaseArray(errors, dims);
  const errorArray = useMappedArray(baseErrorsArray, dimensionMapping);

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

  const mappedAbscissaParams = axisMapping[dimensionMapping.indexOf('x')];
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
        mapperState={dimensionMapping}
        onChange={setDimensionMapping}
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
