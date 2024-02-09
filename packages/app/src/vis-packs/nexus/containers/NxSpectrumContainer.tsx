import { ScaleType } from '@h5web/lib';
import { assertGroup, isAxisScaleType } from '@h5web/shared/guards';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import { useLineConfig } from '../../core/line/config';
import MappedLineVis from '../../core/line/MappedLineVis';
import { getSliceSelection } from '../../core/utils';
import type { VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { assertNumericNxData } from '../guards';
import { useNxData } from '../hooks';
import NxValuesFetcher from '../NxValuesFetcher';
import { areSameDims } from '../utils';

function NxSpectrumContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertNumericNxData(nxData);
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

  const { autoScale } = config;
  const selection = autoScale ? getSliceSelection(dimMapping) : undefined;

  return (
    <>
      <DimensionMapper
        rawDims={signalDims}
        axisLabels={axisLabels}
        mapperState={dimMapping}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping}>
        <NxValuesFetcher
          nxData={nxData}
          selection={selection}
          render={(nxValues) => {
            const { signal, errors, axisValues, auxValues, auxErrors, title } =
              nxValues;

            return (
              <MappedLineVis
                dataset={signalDef.dataset}
                selection={selection}
                value={signal}
                valueLabel={signalDef.label}
                errors={errors}
                auxLabels={auxDefs.map((def) => def?.label)}
                auxValues={auxValues}
                auxErrors={auxErrors}
                dims={signalDims}
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
