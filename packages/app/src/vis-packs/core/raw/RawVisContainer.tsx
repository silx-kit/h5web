import { DimensionMapper, getSliceSelection } from '@h5web/lib';
import { assertDataset, assertNonNullShape } from '@h5web/shared/guards';

import { useDimMappingState } from '../../../dim-mapping-store';
import { useValuesInCache } from '../../../hooks';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { useRawConfig } from './config';
import MappedRawVis from './MappedRawVis';
import ScalarFetcher from './ScalarFetcher';

function RawVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertNonNullShape(entity);

  const { dims } = entity.shape;
  const [dimMapping, setDimMapping] = useDimMappingState({
    dims,
    axesCount: 0, // slicing only
  });

  const config = useRawConfig();
  const selection = getSliceSelection(dimMapping);
  const canSliceFast = useValuesInCache(entity);

  return (
    <>
      {dims.length > 0 && (
        <DimensionMapper
          className={visualizerStyles.dimMapper}
          dims={dims}
          dimMapping={dimMapping}
          canSliceFast={canSliceFast}
          onChange={setDimMapping}
        />
      )}
      <VisBoundary resetKey={dimMapping} isSlice>
        <ScalarFetcher
          dataset={entity}
          selection={selection}
          render={(value) => (
            <MappedRawVis
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

export default RawVisContainer;
