import { assertArrayShape, assertDataset } from '@h5web/shared/guards';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useValuesInCache } from '../../../dimension-mapper/hooks';
import { useDimMappingState } from '../../../dimension-mapper/store';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { useScalarConfig } from '../scalar/config';
import MappedScalarVis from '../scalar/MappedScalarVis';
import { getSliceSelection } from '../utils';
import ValueFetcher from '../ValueFetcher';

function ArrayVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);

  const { shape: dims } = entity;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 0); // no axes, slicing only

  const config = useScalarConfig();
  const selection = getSliceSelection(dimMapping);

  return (
    <>
      <DimensionMapper
        dims={dims}
        dimMapping={dimMapping}
        isCached={useValuesInCache(entity)}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping} isSlice={selection !== undefined}>
        <ValueFetcher
          dataset={entity}
          selection={selection}
          render={(value) => (
            <MappedScalarVis
              dataset={entity}
              value={value}
              toolbarContainer={toolbarContainer}
              config={config}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default ArrayVisContainer;
