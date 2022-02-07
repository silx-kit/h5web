import {
  assertDataset,
  assertArrayShape,
  assertNumericType,
  assertNumDims,
} from '@h5web/shared';
import { useContext } from 'react';

import { ProviderContext } from '../../../providers/context';
import VisBoundary from '../../VisBoundary';
import type { VisContainerProps } from '../../models';
import ValueFetcher from '../ValueFetcher';
import MappedRgbVis from './MappedRgbVis';

function RgbVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertNumDims(entity, 3);
  assertNumericType(entity);

  const { attrValuesStore } = useContext(ProviderContext);
  const subclassAttr = attrValuesStore.getSingle(entity, 'IMAGE_SUBCLASS');
  if (subclassAttr && subclassAttr !== 'IMAGE_TRUECOLOR') {
    throw new Error('RGB Vis only supports IMAGE_TRUECOLOR.');
  }

  const { shape: dims } = entity;

  return (
    <VisBoundary loadingMessage="Loading image">
      <ValueFetcher
        dataset={entity}
        render={(value) => (
          <MappedRgbVis
            value={value}
            dims={dims}
            toolbarContainer={toolbarContainer}
            title={entity.name}
          />
        )}
      />
    </VisBoundary>
  );
}

export default RgbVisContainer;
