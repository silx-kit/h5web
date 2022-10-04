import { assertDefined, assertGroup, assertNumDims } from '@h5web/shared';
import { isEqual } from 'lodash';

import VisBoundary from '../../VisBoundary';
import MappedScatterVis from '../../core/scatter/MappedScatterVis';
import { useScatterConfig } from '../../core/scatter/config';
import type { VisContainerProps } from '../../models';
import NxValuesFetcher from '../NxValuesFetcher';
import { assertNumericNxData } from '../guards';
import { useNxData } from '../hooks';

function NxScatterContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertNumericNxData(nxData);
  const { signalDataset, axisDatasets, axisLabels, silxStyle } = nxData;

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

  const [xScaleType, yScaleType] = silxStyle.axisScaleTypes || [];

  const config = useScatterConfig({
    scaleType: silxStyle.signalScaleType,
    xScaleType,
    yScaleType,
  });

  return (
    <VisBoundary>
      <NxValuesFetcher
        nxData={nxData}
        render={(nxValues) => {
          const { signal, axisValues, title } = nxValues;

          return (
            <MappedScatterVis
              value={signal}
              axisLabels={axisLabels}
              axisValues={axisValues}
              title={title}
              toolbarContainer={toolbarContainer}
              config={config}
            />
          );
        }}
      />
    </VisBoundary>
  );
}

export default NxScatterContainer;
