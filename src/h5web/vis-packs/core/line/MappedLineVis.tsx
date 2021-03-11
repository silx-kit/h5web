import { ReactElement, useEffect } from 'react';
import shallow from 'zustand/shallow';
import LineVis from './LineVis';
import {
  useMappedArray,
  useDomain,
  useBaseArray,
  useDatasetValue,
} from '../hooks';
import { useLineConfig } from './config';
import type { AxisMapping, ScaleType } from '../models';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import type { Dataset } from '../../../providers/models';
import type {
  HDF5NumericType,
  HDF5SimpleShape,
} from '../../../providers/hdf5-models';

interface Props {
  valueDataset: Dataset<HDF5SimpleShape, HDF5NumericType>;
  valueLabel?: string;
  valueScaleType?: ScaleType;
  errorsDataset?: Dataset<HDF5SimpleShape, HDF5NumericType>;
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title?: string;
}

function MappedLineVis(props: Props): ReactElement {
  const {
    valueDataset,
    valueLabel,
    valueScaleType,
    errorsDataset,
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

  const value = useDatasetValue(valueDataset);
  const baseDataArray = useBaseArray(value, dims);
  const dataArray = useMappedArray(baseDataArray, dimMapping);

  const errors = useDatasetValue(errorsDataset);
  const baseErrorsArray = useBaseArray(errors, dims);
  const errorArray = useMappedArray(baseErrorsArray, dimMapping);

  // Disable `autoScale` for 1D datasets (baseArray and dataArray are the same)
  useEffect(() => {
    disableAutoScale(baseDataArray.shape.length <= 1);
  }, [baseDataArray.shape, disableAutoScale]);

  const dataValues = (autoScale ? dataArray : baseDataArray).data as number[];
  const errorValues = autoScale
    ? errorArray && (errorArray.data as number[])
    : baseErrorsArray && (baseErrorsArray.data as number[]);
  const dataDomain = useDomain(
    dataValues,
    yScaleType,
    showErrors ? errorValues : undefined
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
