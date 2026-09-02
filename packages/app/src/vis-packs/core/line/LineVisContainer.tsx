import { DimensionMapper, getSliceSelection } from '@h5web/lib';
import {
  assertArrayShape,
  assertDataset,
  assertNumericLikeType,
} from '@h5web/shared/guards';

import { useDimMappingState } from '../../../dim-mapping-store';
import { usePrefetchValue, useValuesInCache } from '../../../hooks';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import DimScaleFetcher from '../../dimscales/DimScaleFetcher';
import { useDimLabels, useDimScaleDefs } from '../../dimscales/hooks';
import { type VisContainerProps } from '../../models';
import { useNcIgnoreValue } from '../../netcdf/hooks';
import VisBoundary from '../../VisBoundary';
import ValueFetcher from '../ValueFetcher';
import { useLineConfig } from './config';
import MappedLineVis from './MappedLineVis';

function LineVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertNumericLikeType(entity);

  const { dims } = entity.shape;
  const [dimMapping, setDimMapping] = useDimMappingState({
    dims,
    axesCount: 1,
  });

  const config = useLineConfig();
  const selection = getSliceSelection(dimMapping);
  const ignoreValue = useNcIgnoreValue(entity);

  /* Request the values before resolving the scales, which suspends - anything
   * after it would not run until the scales are resolved */
  usePrefetchValue(entity, selection);

  const dimLabels = useDimLabels(entity);
  const dimScaleDefs = useDimScaleDefs(entity, dimLabels);
  const axisLabels = dimScaleDefs.map((def) => def?.label);

  return (
    <>
      <DimensionMapper
        className={visualizerStyles.dimMapper}
        dims={dims}
        dimHints={dimLabels}
        dimMapping={dimMapping}
        canSliceFast={useValuesInCache(entity)}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping} isSlice={selection !== undefined}>
        <DimScaleFetcher
          defs={dimScaleDefs}
          render={(axisValues) => (
            <ValueFetcher
              dataset={entity}
              selection={selection}
              render={(value) => (
                <MappedLineVis
                  dataset={entity}
                  value={value}
                  dimMapping={dimMapping}
                  axisLabels={axisLabels}
                  axisValues={axisValues}
                  title={entity.name}
                  toolbarContainer={toolbarContainer}
                  config={config}
                  ignoreValue={ignoreValue}
                />
              )}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default LineVisContainer;
