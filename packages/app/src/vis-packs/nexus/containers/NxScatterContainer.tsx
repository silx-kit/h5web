import {
  assertDefined,
  assertGroupWithChildren,
  assertNumDims,
} from '@h5web/shared';
import { isEqual } from 'lodash';

import VisBoundary from '../../VisBoundary';
import MappedScatterVis from '../../core/scatter/MappedScatterVis';
import type { VisContainerProps } from '../../models';
import NxValuesFetcher from '../NxValuesFetcher';
import { assertNumericNxData } from '../guards';
import { useNxData } from '../hooks';
import { assertScatterAxisParams } from '../utils';

function NxScatterContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroupWithChildren(entity);

  const nxData = useNxData(entity);
  assertNumericNxData(nxData);
  const { signalDataset, axisDatasets, silxStyle } = nxData;

  assertNumDims(signalDataset, 1);
  const signalDims = signalDataset.shape;

  const [xDataset, yDataset] = axisDatasets;
  assertDefined(xDataset);
  assertDefined(yDataset);
  const xDims = xDataset.shape;
  const yDims = yDataset.shape;

  if (!isEqual(xDims, signalDims) || !isEqual(yDims, signalDims)) {
    const dimsStr = JSON.stringify({ signalDims, xDims, yDims });
    throw new Error(`Signal and axes dimensions don't match: ${dimsStr}`);
  }

  return (
    <VisBoundary>
      <NxValuesFetcher
        nxData={nxData}
        render={(nxValues) => {
          const { signal, axisMapping, title } = nxValues;

          const [xAxisParams, yAxisParams] = axisMapping;
          assertScatterAxisParams(xAxisParams);
          assertScatterAxisParams(yAxisParams);

          return (
            <MappedScatterVis
              value={signal}
              abscissaParams={xAxisParams}
              ordinateParams={yAxisParams}
              title={title}
              toolbarContainer={toolbarContainer}
              colorScaleType={silxStyle.signalScaleType}
            />
          );
        }}
      />
    </VisBoundary>
  );
}

export default NxScatterContainer;
