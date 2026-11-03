import { DimensionMapper, getSliceSelection } from '@h5web/lib';
import {
  assertArrayShape,
  assertDataset,
  assertNumericLikeType,
} from '@h5web/shared/guards';
import { useMemo } from 'react';

import { useDimMappingState } from '../../../dim-mapping-store';
import { useValuesInCache } from '../../../hooks';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import ValueFetcher from '../ValueFetcher';
import { useLineConfig } from './config';
import MappedLineVis from './MappedLineVis';
import { getMultiPlotMapping } from './utils';

function LineVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertNumericLikeType(entity);

  const { dims } = entity.shape;
  const [dimMapping, setDimMapping, multiDim, setMultiDim] = useDimMappingState(
    { dims, axesCount: 1 },
  );

  const lineMapping = useMemo(
    () => getMultiPlotMapping(dimMapping, multiDim),
    [dimMapping, multiDim],
  );

  const config = useLineConfig();
  const selection = getSliceSelection(lineMapping);
  const isCached = useValuesInCache(entity);

  return (
    <>
      <DimensionMapper
        className={visualizerStyles.dimMapper}
        dims={dims}
        dimMapping={dimMapping}
        canSliceFast={(m) => isCached(getMultiPlotMapping(m, multiDim))}
        onChange={setDimMapping}
        multiDim={multiDim}
        onMultiDimChange={setMultiDim}
      />
      <VisBoundary resetKey={lineMapping} isSlice={selection !== undefined}>
        <ValueFetcher
          dataset={entity}
          selection={selection}
          render={(value) => (
            <MappedLineVis
              dataset={entity}
              value={value}
              dimMapping={lineMapping}
              title={entity.name}
              toolbarContainer={toolbarContainer}
              config={config}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default LineVisContainer;
