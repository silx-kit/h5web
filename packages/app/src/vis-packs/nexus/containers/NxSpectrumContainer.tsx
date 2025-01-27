import { ScaleType } from '@h5web/lib';
import { assertGroup, isAxisScaleType } from '@h5web/shared/guards';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/store';
import { useLineConfig } from '../../core/line/config';
import MappedLineVis from '../../core/line/MappedLineVis';
import { getSliceSelection } from '../../core/utils';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { assertNumericLikeNxData } from '../guards';
import { useNxData, useNxValuesCached } from '../hooks';
import NxValuesFetcher from '../NxValuesFetcher';
import { areSameDims } from '../utils';

function NxSpectrumContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertNumericLikeNxData(nxData);

  const { signalDef, axisDefs, auxDefs, silxStyle } = nxData;
  const signalDims = signalDef.dataset.shape;
  const errorDims = signalDef.errorDataset?.shape;

  if (errorDims && !areSameDims(signalDims, errorDims)) {
    const dimsStr = JSON.stringify({ signalDims, errorsDims: errorDims });
    throw new Error(`Signal and errors dimensions don't match: ${dimsStr}`);
  }

  const [dimMapping, setDimMapping] = useDimMappingState(signalDims, 1);

  const axisLabels = axisDefs.map((def) => def?.label);
  const xDimIndex = dimMapping.indexOf('x');

  const config = useLineConfig({
    xScaleType: silxStyle.axisScaleTypes?.[xDimIndex],
    yScaleType: isAxisScaleType(silxStyle.signalScaleType)
      ? silxStyle.signalScaleType
      : ScaleType.Linear,
  });

  return (
    <>
      <DimensionMapper
        dims={signalDims}
        axisLabels={axisLabels}
        dimMapping={dimMapping}
        isCached={useNxValuesCached(nxData)}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping}>
        <NxValuesFetcher
          nxData={nxData}
          selection={getSliceSelection(dimMapping)}
          render={(nxValues) => {
            const { signal, errors, axisValues, auxValues, auxErrors, title } =
              nxValues;

            return (
              <MappedLineVis
                dataset={signalDef.dataset}
                value={signal}
                valueLabel={signalDef.label}
                errors={errors}
                auxLabels={auxDefs.map((def) => def.label)}
                auxValues={auxValues}
                auxErrors={auxErrors}
                dimMapping={dimMapping}
                axisLabels={axisLabels}
                axisValues={axisValues}
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

export default NxSpectrumContainer;
