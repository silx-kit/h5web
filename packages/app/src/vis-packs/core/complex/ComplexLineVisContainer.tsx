import {
  assertDataset,
  assertArrayShape,
  assertComplexType,
} from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import type { VisContainerProps } from '../../models';
import ValueFetcher from '../ValueFetcher';
import { useLineConfig } from '../line/config';
import { getSliceSelection } from '../utils';
import MappedComplexLineVis from './MappedComplexLineVis';
import { useComplexLineConfig } from './lineConfig';

function ComplexLineVisContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertDataset(entity);
  assertArrayShape(entity);
  assertComplexType(entity);

  const { shape: dims } = entity;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 1);

  const config = useComplexLineConfig();
  const lineConfig = useLineConfig();
  const { autoScale } = lineConfig;

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
          selection={autoScale ? getSliceSelection(dimMapping) : undefined}
          render={(value) => (
            <MappedComplexLineVis
              value={value}
              dims={dims}
              dimMapping={dimMapping}
              title={entity.name}
              toolbarContainer={toolbarContainer}
              config={config}
              lineConfig={lineConfig}
            />
          )}
        />
      </VisBoundary>
    </>
  );
}

export default ComplexLineVisContainer;
