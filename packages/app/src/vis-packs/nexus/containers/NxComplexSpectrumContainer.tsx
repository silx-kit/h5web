import { assertGroupWithChildren } from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import MappedComplexLineVis from '../../core/complex/MappedComplexLineVis';
import { useLineConfig } from '../../core/line/config';
import type { VisContainerProps } from '../../models';
import NxValuesFetcher from '../NxValuesFetcher';
import { assertComplexNxData } from '../guards';
import { useNxData } from '../hooks';

function NxComplexSpectrumContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroupWithChildren(entity);

  const nxData = useNxData(entity);
  assertComplexNxData(nxData);
  const { signalDataset, silxStyle } = nxData;

  const signalDims = signalDataset.shape;

  const [dimMapping, setDimMapping] = useDimMappingState(signalDims, 1);

  const autoScale = useLineConfig((state) => state.autoScale);

  return (
    <>
      <DimensionMapper
        rawDims={signalDims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping}>
        <NxValuesFetcher
          nxData={nxData}
          dimMapping={autoScale ? dimMapping : undefined}
          render={(nxValues) => {
            const { signal, signalLabel, axisMapping, title } = nxValues;

            return (
              <MappedComplexLineVis
                value={signal}
                valueLabel={signalLabel}
                valueScaleType={silxStyle.signalScaleType}
                dims={signalDims}
                dimMapping={dimMapping}
                axisMapping={axisMapping}
                title={title}
                toolbarContainer={toolbarContainer}
              />
            );
          }}
        />
      </VisBoundary>
    </>
  );
}

export default NxComplexSpectrumContainer;
