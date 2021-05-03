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
  useDomains,
} from '../hooks';
import { useLineConfig } from './config';
import type { ScaleType } from '../models';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import type {
  Dataset,
  NumArrayDataset,
  ScalarShape,
  StringType,
} from '../../../providers/models';
import { useAxisMapping } from '../../nexus/hooks';
import type { AxisDatasetMapping } from '../../nexus/models';

type HookArgs = [number[], DimensionMapping, boolean];

interface Props {
  valueDataset: NumArrayDataset;
  valueLabel?: string;
  valueScaleType?: ScaleType;
  errorsDataset?: NumArrayDataset;
  auxDatasets?: NumArrayDataset[];
  dims: number[];
  dimMapping: DimensionMapping;
  titleDataset?: Dataset<ScalarShape, StringType>;
  axisDatasets?: AxisDatasetMapping;
  axisScaleTypes?: ScaleType[];
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
    titleDataset,
    axisDatasets = [],
    axisScaleTypes,
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

  const title =
    useDatasetValue(titleDataset) || valueLabel || valueDataset.name;
  const axisMapping = useAxisMapping(axisDatasets, axisScaleTypes);

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
