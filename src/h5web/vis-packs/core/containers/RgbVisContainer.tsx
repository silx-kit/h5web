import {
  assertDataset,
  assertArrayShape,
  assertIntegerType,
  assertNumDims,
} from '../../../guards';
import type { VisContainerProps } from '../../models';
import VisBoundary from '../VisBoundary';
import ValueFetcher from '../ValueFetcher';
import RgbVis from '../rgb/RgbVis';
import { useRgbVisConfig } from '../rgb/config';
import shallow from 'zustand/shallow';

function RgbVisContainer(props: VisContainerProps) {
  const { entity } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertNumDims(entity, 3);
  assertIntegerType(entity);

  const { shape: dims } = entity;

  const { showGrid, layout } = useRgbVisConfig((state) => state, shallow);

  return (
    <VisBoundary loadingMessage="Loading image">
      <ValueFetcher
        dataset={entity}
        render={(value) => {
          return (
            <RgbVis
              value={value}
              dims={dims}
              title={entity.name}
              showGrid={showGrid}
              layout={layout}
            />
          );
        }}
      />
    </VisBoundary>
  );
}

export default RgbVisContainer;
