import { DimensionMapper, getSliceSelection } from '@h5web/lib';
import {
  assertArrayShape,
  assertDataset,
  assertMinDims,
  assertNumericType,
} from '@h5web/shared/guards';

import { useDimMappingState } from '../../../dim-mapping-store';
import { useAttrValue, useValuesInCache } from '../../../hooks';
import { findScalarStrAttr } from '../../../utils';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useDimScales } from '../../dimscales/hooks';
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

  const subClassAttr = findScalarStrAttr(entity, 'IMAGE_SUBCLASS');
  const imageSubClass = useAttrValue(entity, subClassAttr);
  if (subClassAttr && imageSubClass !== 'IMAGE_TRUECOLOR') {
    throw new Error('RGB visualization supports only IMAGE_TRUECOLOR');
  }

  const { dims } = entity.shape;
  const [dimMapping, setDimMapping] = useDimMappingState({
    dims,
    axesCount: 2,
    lockedDimsCount: 1,
  });

  const config = useRgbConfig();
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
            <MappedRgbVis
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

export default RgbVisContainer;
