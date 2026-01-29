import { DimensionMapper, getSliceSelection } from '@h5web/lib';
import {
  assertCompoundType,
  assertDataset,
  assertNonNullShape,
  assertPrintableCompoundType,
} from '@h5web/shared/guards';

import { useDimMappingState } from '../../../dim-mapping-store';
import { useValuesInCache } from '../../../hooks';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { useMatrixConfig } from '../matrix/config';
import ValueFetcher from '../ValueFetcher';
import MappedCompoundVis from './MappedCompoundVis';

function CompoundVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertNonNullShape(entity);
  assertCompoundType(entity);
  assertPrintableCompoundType(entity);

  const { dims } = entity.shape;
  const [dimMapping, setDimMapping] = useDimMappingState({
    dims,
    axesCount: 1,
  });

  const config = useMatrixConfig();
  const selection = getSliceSelection(dimMapping);

  return (
    <>
      <DimensionMapper
        className={visualizerStyles.dimMapper}
        dims={dims}
        dimMapping={dimMapping}
        canSliceFast={useValuesInCache(entity)}
        onChange={setDimMapping}
      />
      <VisBoundary isSlice={selection !== undefined}>
        <ValueFetcher
          dataset={entity}
          selection={selection}
          render={(value) => (
            <MappedCompoundVis
              dataset={entity}
              value={value}
              toolbarContainer={toolbarContainer}
              dimMapping={dimMapping}
              config={config}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default CompoundVisContainer;
