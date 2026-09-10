import { DimensionMapper, getSliceSelection } from '@h5web/lib';
import {
  assertArrayShape,
  assertDataset,
  assertNumericLikeType,
} from '@h5web/shared/guards';

import { useDimMappingState } from '../../../dim-mapping-store';
import { useValuesInCache } from '../../../hooks';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useDimScales } from '../../dimscales/hooks';
import { type VisContainerProps } from '../../models';
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

  const dimScales = useDimScales(entity);
  const axisLabels = dimScales.map((scale) => scale?.label);
  const axisValues = dimScales.map((scale) => scale?.value);

  return (
    <>
      <DimensionMapper
        className={visualizerStyles.dimMapper}
        dims={dims}
        dimHints={axisLabels}
        dimMapping={dimMapping}
        canSliceFast={useValuesInCache(entity)}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping} isSlice={selection !== undefined}>
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
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default LineVisContainer;
