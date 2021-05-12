import { isEqual } from 'lodash-es';
import { assertGroup, assertNumericType } from '../../../guards';
import MappedLineVis from '../../core/line/MappedLineVis';
import type { VisContainerProps } from '../../models';
import { useDimMappingState } from '../../hooks';
import { getNxData, getDatasetLabel } from '../utils';
import VisBoundary from '../../core/VisBoundary';
import NxValuesFetcher from '../NxValuesFetcher';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';

function NxSpectrumContainer(props: VisContainerProps) {
  const { entity } = props;
  assertGroup(entity);

  const nxData = getNxData(entity);
  const { signalDataset, errorsDataset, silxStyle } = nxData;
  assertNumericType(signalDataset);

  const signalDims = signalDataset.shape;
  const errorsDims = errorsDataset?.shape;

  if (errorsDims && !isEqual(signalDims, errorsDims)) {
    const dimsStr = JSON.stringify({ signalDims, errorsDims });
    throw new Error(`Signal and errors dimensions don't match: ${dimsStr}`);
  }

  const [dimMapping, setDimMapping] = useDimMappingState(signalDims, 1);

  return (
    <>
      <DimensionMapper
        rawDims={signalDims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping}>
        <NxValuesFetcher
          nxData={nxData}
          render={(nxValues) => {
            const signalLabel = getDatasetLabel(signalDataset);
            const { signal, errors, axisMapping, auxiliaries, title } =
              nxValues;

            return (
              <MappedLineVis
                value={signal as number[]}
                valueLabel={signalLabel}
                valueScaleType={silxStyle.signalScaleType}
                errors={errors}
                auxiliaries={auxiliaries}
                dims={signalDims}
                dimMapping={dimMapping}
                axisMapping={axisMapping}
                title={title || signalLabel}
              />
            );
          }}
        />
      </VisBoundary>
    </>
  );
}

export default NxSpectrumContainer;
