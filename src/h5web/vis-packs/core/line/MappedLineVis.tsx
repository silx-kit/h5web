import { useEffect } from 'react';
import shallow from 'zustand/shallow';
import LineVis from './LineVis';
import {
  useDatasetValue,
  useDatasetValues,
  useCombinedDomain,
  useMappedArrays,
  useMappedArray,
  useDomain,
} from '../hooks';
import { useLineConfig } from './config';
import type { AxisMapping, ScaleType } from '../models';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import type { NumArrayDataset } from '../../../providers/models';
import { getDomain } from '../utils';

type HookArgs = [number[], DimensionMapping, boolean];

interface Props {
  valueDataset: NumArrayDataset;
  valueLabel?: string;
  valueScaleType?: ScaleType;
  errorsDataset?: NumArrayDataset;
  auxDatasets?: NumArrayDataset[];
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title?: string;
}

function MappedLineVis(props: Props) {
  const {
    valueDataset,
    valueLabel,
    valueScaleType,
    errorsDataset,
    auxDatasets = [],
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

  const value = useDatasetValue(valueDataset);
  const [dataArray, dataForDomain] = useMappedArray(value, ...hookArgs);

  const errors = useDatasetValue(errorsDataset);
  const [errorArray, errorsForDomain] = useMappedArray(errors, ...hookArgs);

  const auxiliaries = Object.values(useDatasetValues(auxDatasets));
  const [auxArrays, auxForDomain] = useMappedArrays(auxiliaries, ...hookArgs);

  const dataDomain = useDomain(
    dataForDomain,
    yScaleType,
    showErrors ? errorsForDomain : undefined
  );
  const auxDomains = auxForDomain.map((arr) => getDomain(arr, yScaleType));
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
