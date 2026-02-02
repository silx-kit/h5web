import { DimensionMapper, getSliceSelection } from '@h5web/lib';
import { assertGroup, assertMinDims } from '@h5web/shared/guards';

import { useDimMappingState } from '../../../dim-mapping-store';
import { useDataContext } from '../../../providers/DataProvider';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useRgbConfig } from '../../core/rgb/config';
import MappedRgbVis from '../../core/rgb/MappedRgbVis';
import { assertImageSubclassIfPresent } from '../../core/rgb/utils';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { assertNumericNxData } from '../guards';
import { useNxData, useNxValuesCached } from '../hooks';
import NxValuesFetcher from '../NxValuesFetcher';

function NxRgbContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertNumericNxData(nxData);

  const { signalDef, axisDefs, defaultSlice } = nxData;
  assertMinDims(signalDef.dataset, 3);

  const { attrValuesStore } = useDataContext();
  assertImageSubclassIfPresent(signalDef.dataset, attrValuesStore);

  const { dims } = signalDef.dataset.shape;
  const [dimMapping, setDimMapping] = useDimMappingState({
    dims,
    axesCount: 2,
    lockedDimsCount: 1,
    defaultSlice,
  });

  const axisLabels = axisDefs.map((def) => def?.label);
  const config = useRgbConfig();

  return (
    <>
      <DimensionMapper
        className={visualizerStyles.dimMapper}
        dims={dims}
        dimHints={axisLabels}
        dimMapping={dimMapping}
        canSliceFast={useNxValuesCached(nxData)}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping}>
        <NxValuesFetcher
          nxData={nxData}
          selection={getSliceSelection(dimMapping)}
          render={(nxValues) => {
            const { signal, axisValues, title } = nxValues;

            return (
              <MappedRgbVis
                dataset={signalDef.dataset}
                value={signal}
                axisLabels={axisLabels}
                axisValues={axisValues}
                dimMapping={dimMapping}
                title={title}
                toolbarContainer={toolbarContainer}
                config={config}
              />
            );
          }}
        />
      </VisBoundary>
    </>
  );
}

export default NxRgbContainer;
