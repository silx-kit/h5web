import { assertGroupWithChildren } from '@h5web/shared';
import { isEqual } from 'lodash';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import MappedLineVis from '../../core/line/MappedLineVis';
import type { VisContainerProps } from '../../models';
import NxValuesFetcher from '../NxValuesFetcher';
import { assertNumericNxData } from '../guards';
import { useNxData } from '../hooks';

function NxSpectrumContainer(props: VisContainerProps) {
  const { entity } = props;
  assertGroupWithChildren(entity);

  const nxData = useNxData(entity);
  assertNumericNxData(nxData);
  const { signalDataset, errorsDataset, silxStyle } = nxData;

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
            const {
              signal,
              signalLabel,
              errors,
              axisMapping,
              auxiliaries,
              title,
            } = nxValues;

            return (
              <MappedLineVis
                value={signal}
                valueLabel={signalLabel}
                valueScaleType={silxStyle.signalScaleType}
                errors={errors}
                auxiliaries={auxiliaries}
                dims={signalDims}
                dimMapping={dimMapping}
                axisMapping={axisMapping}
                title={title}
                dtype={signalDataset.type}
              />
            );
          }}
        />
      </VisBoundary>
    </>
  );
}

export default NxSpectrumContainer;
