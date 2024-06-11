import {
  assertArrayShape,
  assertCompoundType,
  assertDataset,
  assertPrintableCompoundType,
} from '@h5web/shared/guards';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import type { VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { useMatrixConfig } from '../matrix/config';
import { getSliceSelection } from '../utils';
import ValueFetcher from '../ValueFetcher';
import MappedCompoundMatrixVis from './MappedCompoundMatrixVis';

function CompoundMatrixVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertCompoundType(entity);
  assertPrintableCompoundType(entity);

  const { shape: dims } = entity;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 1);

  const config = useMatrixConfig();
  const selection = getSliceSelection(dimMapping);

  return (
    <>
      <DimensionMapper
        dims={dims}
        dimMapping={dimMapping}
        onChange={setDimMapping}
      />
      <VisBoundary isSlice={selection !== undefined}>
        <ValueFetcher
          dataset={entity}
          selection={selection}
          render={(value) => (
            <MappedCompoundMatrixVis
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

export default CompoundMatrixVisContainer;
