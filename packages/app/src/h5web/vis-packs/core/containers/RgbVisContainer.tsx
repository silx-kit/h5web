import shallow from 'zustand/shallow';
import {
  assertDataset,
  assertArrayShape,
  assertNumericType,
  assertNumDims,
  DTypeClass,
} from '@h5web/shared';
import { RgbVis } from '@h5web/lib';
import type { VisContainerProps } from '../../models';
import VisBoundary from '../VisBoundary';
import ValueFetcher from '../ValueFetcher';
import { useRgbVisConfig } from '../rgb/config';
import { getAttributeValue } from '../../../utils';

function RgbVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertNumDims(entity, 3);
  assertNumericType(entity);

  const subclassAttr = getAttributeValue(entity, 'IMAGE_SUBCLASS');
  if (typeof subclassAttr === 'string' && subclassAttr !== 'IMAGE_TRUECOLOR') {
    throw new Error('RGB Vis only supports IMAGE_TRUECOLOR.');
  }

  const { shape: dims } = entity;

  const { showGrid, layout, imageType } = useRgbVisConfig(
    (state) => state,
    shallow
  );

  return (
    <VisBoundary loadingMessage="Loading image">
      <ValueFetcher
        dataset={entity}
        render={(value) => {
          return (
            <RgbVis
              value={value}
              dims={dims}
              floatFormat={entity.type.class === DTypeClass.Float}
              title={entity.name}
              showGrid={showGrid}
              layout={layout}
              imageType={imageType}
            />
          );
        }}
      />
    </VisBoundary>
  );
}

export default RgbVisContainer;
