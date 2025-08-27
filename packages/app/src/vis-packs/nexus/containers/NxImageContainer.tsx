import { DimensionMapper, getSliceSelection } from '@h5web/lib';
import {
  assertDatasetValue,
  assertGroup,
  assertMinDims,
  assertNumericLikeType,
  hasComplexType,
} from '@h5web/shared/guards';
import { useState } from 'react';

import { useDimMappingState } from '../../../dim-mapping-store';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import MappedComplexVis from '../../core/complex/MappedComplexVis';
import { useHeatmapConfig } from '../../core/heatmap/config';
import MappedHeatmapVis from '../../core/heatmap/MappedHeatmapVis';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { useNxData, useNxImageDataToFetch, useNxValuesCached } from '../hooks';
import NxSignalPicker from '../NxSignalPicker';
import NxValuesFetcher from '../NxValuesFetcher';
import { guessKeepRatio } from '../utils';

function NxImageContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);

  const { signalDef, axisDefs, auxDefs, silxStyle } = nxData;
  const [selectedDef, setSelectedDef] = useState(signalDef);
  const { dataset: selectedDataset } = selectedDef;

  assertMinDims(selectedDataset, 2);
  const { shape: dims } = selectedDataset;
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
        dimHints={axisLabels}
        dimMapping={dimMapping}
        canSliceFast={useNxValuesCached(nxData)}
        onChange={setDimMapping}
      />
      <VisBoundary resetKey={dimMapping}>
        <NxValuesFetcher
          nxData={nxDataToFetch}
          selection={getSliceSelection(dimMapping)}
          render={(nxValues) => {
            const { signal, axisValues, title } = nxValues;

            if (hasComplexType(selectedDataset)) {
              assertDatasetValue(signal, selectedDataset);

              return (
                <MappedComplexVis
                  value={signal}
                  dims={dims}
                  dimMapping={dimMapping}
                  axisLabels={axisLabels}
                  axisValues={axisValues}
                  title={title}
                  toolbarContainer={toolbarContainer}
                  config={config}
                />
              );
            }

            assertNumericLikeType(selectedDataset);
            assertDatasetValue(signal, selectedDataset);
            return (
              <MappedHeatmapVis
                dataset={selectedDataset}
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
