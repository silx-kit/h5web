import { assertGroupWithChildren, assertMinDims } from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import MappedComplexVis from '../../core/complex/MappedComplexVis';
import type { VisContainerProps } from '../../models';
import NxValuesFetcher from '../NxValuesFetcher';
import { useNxData } from '../hooks';
import { assertComplexSignal } from '../utils';

function NxComplexImageContainer(props: VisContainerProps) {
  const { entity } = props;
  assertGroupWithChildren(entity);

  const nxData = useNxData(entity);
  assertComplexSignal(nxData);

  const { signalDataset, silxStyle } = nxData;
  assertMinDims(signalDataset, 2);

  const { shape: dims } = signalDataset;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping}>
        <NxValuesFetcher
          nxData={nxData}
          dimMapping={dimMapping}
          render={(nxValues) => {
            const { signal, axisMapping, title } = nxValues;

            return (
              <MappedComplexVis
                value={signal}
                dims={dims}
                dimMapping={dimMapping}
                axisMapping={axisMapping}
                title={title}
                colorScaleType={silxStyle.signalScaleType}
              />
            );
          }}
        />
      </VisBoundary>
    </>
  );
}

export default NxComplexImageContainer;
