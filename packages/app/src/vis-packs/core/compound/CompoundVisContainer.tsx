import {
  assertCompoundType,
  assertDataset,
  assertNonNullShape,
  assertPrintableCompoundType,
} from '@h5web/shared/guards';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useValuesInCache } from '../../../dimension-mapper/hooks';
import { useDimMappingState } from '../../../dimension-mapper/store';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { useMatrixConfig } from '../matrix/config';
import { getSliceSelection } from '../utils';
import ValueFetcher from '../ValueFetcher';
import MappedCompoundVis from './MappedCompoundVis';

function CompoundVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertNonNullShape(entity);
  assertCompoundType(entity);
  assertPrintableCompoundType(entity);

  const { shape: dims } = entity;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 1);

  const config = useMatrixConfig();
  const selection = getSliceSelection(dimMapping);

  return (
    <>
      <DimensionMapper
        className={visualizerStyles.dimMapper}
        dims={dims}
        dimMapping={dimMapping}
        isCached={useValuesInCache(entity)}
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
