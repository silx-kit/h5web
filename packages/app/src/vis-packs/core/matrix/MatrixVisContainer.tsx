import {
  assertArrayShape,
  assertDataset,
  assertPrintableType,
} from '@h5web/shared/guards';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useValuesInCache } from '../../../dimension-mapper/hooks';
import { useDimMappingState } from '../../../dimension-mapper/store';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { getSliceSelection } from '../utils';
import ValueFetcher from '../ValueFetcher';
import { useMatrixConfig } from './config';
import MappedMatrixVis from './MappedMatrixVis';

function MatrixVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertPrintableType(entity);

  const { shape: dims } = entity;
  const axesCount = Math.min(dims.length, 2);
  const [dimMapping, setDimMapping] = useDimMappingState(dims, axesCount);

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
      <VisBoundary resetKey={dimMapping} isSlice={selection !== undefined}>
        <ValueFetcher
          dataset={entity}
          selection={selection}
          render={(value) => (
            <MappedMatrixVis
              dataset={entity}
              value={value}
              dimMapping={dimMapping}
              toolbarContainer={toolbarContainer}
              config={config}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default MatrixVisContainer;
