import { assertGroup, assertMinDims } from '@h5web/shared/guards';
import { useState } from 'react';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import { useComplexConfig } from '../../core/complex/config';
import MappedComplexVis from '../../core/complex/MappedComplexVis';
import { useHeatmapConfig } from '../../core/heatmap/config';
import { getSliceSelection } from '../../core/utils';
import type { VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { assertComplexNxData } from '../guards';
import { useNxData, useNxImageDataToFetch, useNxValuesCached } from '../hooks';
import NxSignalPicker from '../NxSignalPicker';
import NxValuesFetcher from '../NxValuesFetcher';
import { guessKeepRatio } from '../utils';

function NxComplexImageContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertComplexNxData(nxData);

  const { signalDef, axisDefs, auxDefs, silxStyle } = nxData;
  const [selectedDef, setSelectedDef] = useState(signalDef);
  assertMinDims(selectedDef.dataset, 2);

  const { shape: dims } = selectedDef.dataset;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);

  const axisLabels = axisDefs.map((def) => def?.label);
  const xAxisDef = axisDefs[dimMapping.indexOf('x')];
  const yAxisDef = axisDefs[dimMapping.indexOf('y')];

  const config = useComplexConfig();
  const heatmapConfig = useHeatmapConfig({
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
              <MappedComplexVis
                value={signal}
                dims={dims}
                dimMapping={dimMapping}
                axisLabels={axisLabels}
                axisValues={axisValues}
                title={title}
                toolbarContainer={toolbarContainer}
                config={config}
                heatmapConfig={heatmapConfig}
              />
            );
          }}
        />
      </VisBoundary>
    </>
  );
}

export default NxComplexImageContainer;
