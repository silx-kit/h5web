import {
  assertDataset,
  assertArrayShape,
  assertNumericType,
  assertMinDims,
} from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import { useDataContext } from '../../../providers/DataProvider';
import VisBoundary from '../../VisBoundary';
import type { VisContainerProps } from '../../models';
import ValueFetcher from '../ValueFetcher';
import { getSliceSelection } from '../utils';
import MappedRgbVis from './MappedRgbVis';
import { useRgbConfig } from './config';

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
  if (dims.at(-1) !== 3) {
    throw new Error('Expected last dimension to have size 3');
  }

  const mappableDims = dims.slice(0, -1);
  const [dimMapping, setDimMapping] = useDimMappingState(mappableDims, 2);

  const config = useRgbConfig();

  return (
    <>
      <DimensionMapper
        rawDims={mappableDims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping} loadingMessage="Loading current slice">
        <ValueFetcher
          dataset={entity}
          selection={getSliceSelection(dimMapping)}
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
