import {
  assertDefined,
  assertGroup,
  assertNumDims,
} from '@h5web/shared/guards';

import { useScatterConfig } from '../../core/scatter/config';
import MappedScatterVis from '../../core/scatter/MappedScatterVis';
import type { VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { assertNumericNxData } from '../guards';
import { useNxData } from '../hooks';
import NxValuesFetcher from '../NxValuesFetcher';
import { areSameDims } from '../utils';

function NxScatterContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertNumericNxData(nxData);
  const { signalDef, axisDefs, silxStyle } = nxData;

  assertNumDims(signalDef.dataset, 1);
  const signalDims = signalDef.dataset.shape;

  const [xDataset, yDataset] = axisDefs;
  assertDefined(xDataset);
  assertDefined(yDataset);
  const xDims = xDataset.dataset.shape;
  const yDims = yDataset.dataset.shape;

  if (!areSameDims(xDims, signalDims) || !areSameDims(yDims, signalDims)) {
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
              axisLabels={axisDefs.map((def) => def?.label)}
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
