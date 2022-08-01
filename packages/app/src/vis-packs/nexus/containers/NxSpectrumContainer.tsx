import { assertGroup } from '@h5web/shared';
import { isEqual } from 'lodash';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import MappedLineVis from '../../core/line/MappedLineVis';
import { useLineConfig } from '../../core/line/config';
import { getSliceSelection } from '../../core/utils';
import type { VisContainerProps } from '../../models';
import NxValuesFetcher from '../NxValuesFetcher';
import { assertNumericNxData } from '../guards';
import { useNxData } from '../hooks';

function NxSpectrumContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertNumericNxData(nxData);
  const { signalDataset, errorDataset, silxStyle } = nxData;

  const signalDims = signalDataset.shape;
  const errorDims = errorDataset?.shape;

  if (errorDims && !isEqual(signalDims, errorDims)) {
    const dimsStr = JSON.stringify({ signalDims, errorsDims: errorDims });
    throw new Error(`Signal and errors dimensions don't match: ${dimsStr}`);
  }

  const [dimMapping, setDimMapping] = useDimMappingState(signalDims, 1);

  const autoScale = useLineConfig((state) => state.autoScale);
  const selection = autoScale ? getSliceSelection(dimMapping) : undefined;

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
          selection={selection}
          render={(nxValues) => {
            const {
              signal,
              signalLabel,
              errors,
              axisMapping,
              auxiliaries,
              title,
            } = nxValues;

            return (
              <MappedLineVis
                dataset={signalDataset}
                selection={selection}
                value={signal}
                valueLabel={signalLabel}
                valueScaleType={silxStyle.signalScaleType}
                errors={errors}
                auxiliaries={auxiliaries}
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

export default NxSpectrumContainer;
