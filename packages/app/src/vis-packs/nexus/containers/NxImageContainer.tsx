import { DimensionMapper, getSliceSelection } from '@h5web/lib';
import { assertGroup, assertMinDims } from '@h5web/shared/guards';
import { useState } from 'react';

import { useDimMappingState } from '../../../dim-mapping-store';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useHeatmapConfig } from '../../core/heatmap/config';
import MappedHeatmapVis from '../../core/heatmap/MappedHeatmapVis';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { assertNumericLikeNxData } from '../guards';
import { useNxData, useNxImageDataToFetch, useNxValuesCached } from '../hooks';
import NxSignalPicker from '../NxSignalPicker';
import NxValuesFetcher from '../NxValuesFetcher';
import { guessKeepRatio } from '../utils';

function NxImageContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertNumericLikeNxData(nxData);

  const { signalDef, axisDefs, auxDefs, silxStyle } = nxData;
  const [selectedDef, setSelectedDef] = useState(signalDef);
  assertMinDims(selectedDef.dataset, 2);

  const { shape: dims } = selectedDef.dataset;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

  const axisLabels = axisDefs.map((def) => def?.label);
  const xAxisDef = axisDefs[dimMapping.indexOf('x')];
  const yAxisDef = axisDefs[dimMapping.indexOf('y')];

  const config = useHeatmapConfig({
    scaleType: silxStyle.signalScaleType,
    keepRatio: guessKeepRatio(xAxisDef, yAxisDef),
  });

  const nxDataToFetch = useNxImageDataToFetch(nxData, selectedDef);

  return (
    <>
      {auxDefs.length > 0 && (
        <NxSignalPicker
          definitions={[signalDef, ...auxDefs]}
          onChange={setSelectedDef}
        />
      )}
      <DimensionMapper
        className={visualizerStyles.dimMapper}
        dims={dims}
        axisLabels={axisLabels}
        dimMapping={dimMapping}
        isCached={useNxValuesCached(nxData)}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping}>
        <NxValuesFetcher
          nxData={nxDataToFetch}
          selection={getSliceSelection(dimMapping)}
          render={(nxValues) => {
            const { signal, axisValues, title } = nxValues;

            return (
              <MappedHeatmapVis
                dataset={selectedDef.dataset}
                value={signal}
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

export default NxImageContainer;
