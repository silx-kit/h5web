import { DimensionMapper, getSliceSelection, ScaleType } from '@h5web/lib';
import { assertGroup, isAxisScaleType } from '@h5web/shared/guards';
import { useState } from 'react';

import { useDimMappingState } from '../../../dim-mapping-store';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useLineConfig } from '../../core/line/config';
import MappedLineVis from '../../core/line/MappedLineVis';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { assertNumericLikeNxData } from '../guards';
import { useNxData, useNxValuesCached } from '../hooks';
import NxLineSignalPicker from '../NxLineSignalPicker';
import NxValuesFetcher from '../NxValuesFetcher';
import { areSameDims } from '../utils';

function NxLineContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertNumericLikeNxData(nxData);

  const { signalDef, axisDefs, auxDefs, defaultSlice, silxStyle } = nxData;
  const signalDims = signalDef.dataset.shape.dims;
  const errorDims = signalDef.errorDataset?.shape.dims;

  if (errorDims && !areSameDims(signalDims, errorDims)) {
    const dimsStr = JSON.stringify({ signalDims, errorsDims: errorDims });
    throw new Error(`Signal and errors dimensions don't match: ${dimsStr}`);
  }

  const [dimMapping, setDimMapping] = useDimMappingState({
    dims: signalDims,
    axesCount: 1,
    defaultSlice,
  });

  const auxLabels = auxDefs.map((def) => def.label);
  const axisLabels = axisDefs.map((def) => def?.label);
  const xDimIndex = dimMapping.indexOf('x');

  const [isSignalVisible, setSignalVisible] = useState(true);
  const [auxVisible, setAuxVisible] = useState(auxDefs.map(() => true));

  const config = useLineConfig({
    xScaleType: silxStyle.axisScaleTypes?.[xDimIndex],
    yScaleType: isAxisScaleType(silxStyle.signalScaleType)
      ? silxStyle.signalScaleType
      : ScaleType.Linear,
  });

  return (
    <>
      {auxDefs.length > 0 && (
        <NxLineSignalPicker
          signalLabel={signalDef.label}
          signalChecked={isSignalVisible}
          auxLabels={auxLabels}
          auxChecked={auxVisible}
          onSignalChange={setSignalVisible}
          onAuxChange={setAuxVisible}
          toolbarContainer={toolbarContainer}
        />
      )}

      <DimensionMapper
        className={visualizerStyles.dimMapper}
        dims={signalDims}
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
            const { signal, errors, axisValues, auxValues, auxErrors, title } =
              nxValues;

            return (
              <MappedLineVis
                dataset={signalDef.dataset}
                value={signal}
                valueLabel={signalDef.label}
                valueVisible={isSignalVisible}
                errors={errors}
                auxLabels={auxLabels}
                auxValues={auxValues}
                auxErrors={auxErrors}
                auxVisible={auxVisible}
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

export default NxLineContainer;
