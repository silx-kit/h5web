import {
  assertDataset,
  assertArrayShape,
  assertCompoundType,
  assertPrintableCompoundType,
} from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import type { VisContainerProps } from '../../models';
import ValueFetcher from '../ValueFetcher';
import { useMatrixConfig } from '../matrix/config';
import { getSliceSelection } from '../utils';
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

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <VisBoundary loadingMessage="Loading current slice">
        <ValueFetcher
          dataset={entity}
          selection={getSliceSelection(dimMapping)}
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
