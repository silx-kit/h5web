import {
  assertDataset,
  assertArrayShape,
  assertNumericType,
} from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import type { VisContainerProps } from '../../models';
import ValueFetcher from '../ValueFetcher';
import { useIgnoreFillValue } from '../hooks';
import { getSliceSelection } from '../utils';
import MappedLineVis from './MappedLineVis';
import { useLineConfig } from './config';

function LineVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertNumericType(entity);

  const { shape: dims } = entity;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 1);

  const config = useLineConfig();

  const { autoScale } = config;
  const selection = autoScale ? getSliceSelection(dimMapping) : undefined;

  const ignoreValue = useIgnoreFillValue(entity);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <VisBoundary
        resetKey={dimMapping}
        loadingMessage={`Loading ${
          autoScale ? 'current slice' : 'entire dataset'
        }`}
      >
        <ValueFetcher
          dataset={entity}
          selection={selection}
          render={(value) => (
            <MappedLineVis
              dataset={entity}
              selection={selection}
              value={value}
              dims={dims}
              dimMapping={dimMapping}
              title={entity.name}
              toolbarContainer={toolbarContainer}
              config={config}
              ignoreValue={ignoreValue}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default LineVisContainer;
