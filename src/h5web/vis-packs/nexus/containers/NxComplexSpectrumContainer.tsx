import { assertGroupWithChildren } from '../../../guards';
import type { VisContainerProps } from '../../models';
import { useDimMappingState } from '../../hooks';
import { getNxData, getDatasetLabel } from '../utils';
import VisBoundary from '../../core/VisBoundary';
import NxValuesFetcher from '../NxValuesFetcher';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import MappedComplexLineVis from '../../core/complex/MappedComplexLineVis';
import { assertComplexNxData } from '../guards';

function NxComplexSpectrumContainer(props: VisContainerProps) {
  const { entity } = props;
  assertGroupWithChildren(entity);

  const nxData = getNxData(entity);
  assertComplexNxData(nxData);
  const { signalDataset, silxStyle } = nxData;

  const signalDims = signalDataset.shape;

  const [dimMapping, setDimMapping] = useDimMappingState(signalDims, 1);

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
          render={(nxValues) => {
            const signalLabel = getDatasetLabel(signalDataset);
            const { signal, axisMapping, title } = nxValues;

            return (
              <MappedComplexLineVis
                value={signal}
                valueLabel={signalLabel}
                valueScaleType={silxStyle.signalScaleType}
                dims={signalDims}
                dimMapping={dimMapping}
                axisMapping={axisMapping}
                title={title || signalLabel}
              />
            );
          }}
        />
      </VisBoundary>
    </>
  );
}

export default NxComplexSpectrumContainer;
