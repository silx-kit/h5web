import { DimensionMapper, getSliceSelection } from '@h5web/lib';
import {
  assertArrayShape,
  assertDataset,
  assertMinDims,
  assertNumericType,
} from '@h5web/shared/guards';

import { useDimMappingState } from '../../../dim-mapping-store';
import { useValuesInCache } from '../../../hooks';
import { useDataContext } from '../../../providers/DataProvider';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import ValueFetcher from '../ValueFetcher';
import { useRgbConfig } from './config';
import MappedRgbVis from './MappedRgbVis';

function RgbVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertMinDims(entity, 3);
  assertNumericType(entity);

  const { attrValuesStore } = useDataContext();
  const subclassAttr = attrValuesStore.getSingle(entity, 'IMAGE_SUBCLASS');
  if (subclassAttr && subclassAttr !== 'IMAGE_TRUECOLOR') {
    throw new Error('RGB Vis only supports IMAGE_TRUECOLOR.');
  }

  const { shape: dims } = entity;
  if (dims[dims.length - 1] !== 3) {
    throw new Error('Expected last dimension to have size 3');
  }

  const [dimMapping, setDimMapping] = useDimMappingState({
    dims,
    axesCount: 2,
    lockedDimsCount: 1,
  });

  const config = useRgbConfig();
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
      <VisBoundary resetKey={dimMapping} isSlice={selection !== undefined}>
        <ValueFetcher
          dataset={entity}
          selection={selection}
          render={(value) => (
            <MappedRgbVis
              dataset={entity}
              value={value}
              dimMapping={dimMapping}
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

export default RgbVisContainer;
