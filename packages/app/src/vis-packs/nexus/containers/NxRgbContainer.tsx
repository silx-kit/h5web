import { assertGroup, assertMinDims } from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import { useRgbConfig } from '../../core/rgb/config';
import MappedRgbVis from '../../core/rgb/MappedRgbVis';
import { getSliceSelection } from '../../core/utils';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { useNxData } from '../hooks';
import NxValuesFetcher from '../NxValuesFetcher';
import { assertNumericSignal } from '../utils';

function NxRgbContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertNumericSignal(nxData);

  const { signalDef, axisDefs } = nxData;
  assertMinDims(signalDef.dataset, 3);

  const { shape: dims } = signalDef.dataset;
  if (dims[dims.length - 1] !== 3) {
    throw new Error('Expected last dimension to have size 3');
  }

  const mappableDims = dims.slice(0, -1);
  const [dimMapping, setDimMapping] = useDimMappingState(mappableDims, 2);
  const config = useRgbConfig();

  return (
    <>
      <DimensionMapper
        rawDims={mappableDims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping}>
        <NxValuesFetcher
          nxData={nxData}
          selection={getSliceSelection(dimMapping)}
          render={(nxValues) => {
            const { signal, axisValues, title } = nxValues;

            return (
              <MappedRgbVis
                dataset={signalDef.dataset}
                value={signal}
                axisLabels={axisDefs.map((def) => def?.label)}
                axisValues={axisValues}
                dimMapping={dimMapping}
                title={title}
                toolbarContainer={toolbarContainer}
                config={config}
              />
            );
          }}
        />
      </VisBoundary>
    </>
  );
}

export default NxRgbContainer;
