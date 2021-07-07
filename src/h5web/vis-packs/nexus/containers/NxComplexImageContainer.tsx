import {
  assertComplexType,
  assertGroupWithChildren,
  assertMinDims,
} from '../../../guards';
import type { VisContainerProps } from '../../models';
import { useDimMappingState } from '../../hooks';
import MappedComplexVis from '../../core/complex/MappedComplexVis';
import VisBoundary from '../../core/VisBoundary';
import NxValuesFetcher from '../NxValuesFetcher';
import type { H5WebComplex } from '../../../providers/models';
import { getNxData, getDatasetLabel } from '../utils';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';

function NxComplexImageContainer(props: VisContainerProps) {
  const { entity } = props;
  assertGroupWithChildren(entity);

  const nxData = getNxData(entity);
  const { signalDataset, silxStyle } = nxData;
  assertComplexType(signalDataset);
  assertMinDims(signalDataset, 2);

  const { shape: dims } = signalDataset;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping}>
        <NxValuesFetcher
          nxData={nxData}
          dimMapping={dimMapping}
          render={(nxValues) => {
            const { signal, axisMapping, title } = nxValues;
            return (
              <MappedComplexVis
                value={signal as H5WebComplex[]}
                dims={dims}
                dimMapping={dimMapping}
                axisMapping={axisMapping}
                title={title || getDatasetLabel(signalDataset)}
                colorScaleType={silxStyle.signalScaleType}
              />
            );
          }}
        />
      </VisBoundary>
    </>
  );
}

export default NxComplexImageContainer;
