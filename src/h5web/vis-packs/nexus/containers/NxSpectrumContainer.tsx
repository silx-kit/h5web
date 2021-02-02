import { ReactElement, useEffect } from 'react';
import { isEqual } from 'lodash-es';
import { assertArray, assertGroup, assertOptionalStr } from '../../../guards';
import { useDatasetValue } from '../../core/hooks';
import MappedLineVis from '../../core/line/MappedLineVis';
import type { VisContainerProps } from '../../models';
import { useAxisMapping, useNxData } from '../hooks';
import { useNxSpectrumConfig } from '../spectrum/config';
import { getDatasetLabel } from '../utils';
import { useDimMappingState } from '../../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';

function NxSpectrumContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  const {
    signalDataset,
    titleDataset,
    errorsDataset,
    axisDatasetMapping,
    silxStyle,
  } = nxData;

  const signalLabel = getDatasetLabel(signalDataset);
  const { axesScaleType, signalScaleType } = silxStyle;
  const signalDims = signalDataset.shape.dims;
  const errorsDims = errorsDataset?.shape.dims;

  if (errorsDims && !isEqual(signalDims, errorsDims)) {
    const dimsStr = JSON.stringify({ signalDims, errorsDims });
    throw new Error(`Signal and errors dimensions don't match: ${dimsStr}`);
  }

  const [dimMapping, setDimMapping] = useDimMappingState(signalDims, 1);

  const value = useDatasetValue(signalDataset.path);
  assertArray<number>(value);

  const errors = useDatasetValue(errorsDataset?.path);
  assertArray<number>(errors);

  const title = useDatasetValue(titleDataset?.path);
  assertOptionalStr(title);

  const axisMapping = useAxisMapping(axisDatasetMapping, axesScaleType);

  const { showErrors, disableErrors } = useNxSpectrumConfig();
  useEffect(() => {
    disableErrors(!errors);
  }, [disableErrors, errors]);

  return (
    <>
      <DimensionMapper
        rawDims={signalDims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <MappedLineVis
        value={value}
        valueLabel={signalLabel}
        valueScaleType={signalScaleType}
        dims={signalDims}
        dimMapping={dimMapping}
        axisMapping={axisMapping}
        title={title || signalLabel}
        errors={errors}
        showErrors={showErrors}
      />
    </>
  );
}

export default NxSpectrumContainer;
