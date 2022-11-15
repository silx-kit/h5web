import { assertGroup, assertMinDims } from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import MappedComplexVis from '../../core/complex/MappedComplexVis';
import { useComplexConfig } from '../../core/complex/config';
import { useHeatmapConfig } from '../../core/heatmap/config';
import { getSliceSelection } from '../../core/utils';
import type { VisContainerProps } from '../../models';
import NxValuesFetcher from '../NxValuesFetcher';
import { useNxData } from '../hooks';
import { assertComplexSignal, guessKeepRatio } from '../utils';

function NxComplexImageContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertComplexSignal(nxData);

  const { signalDef, axisDefs, silxStyle } = nxData;
  assertMinDims(signalDef.dataset, 2);

  const { shape: dims } = signalDef.dataset;
  const [dimMapping, setDimMapping] = useDimMappingState(dims, 2);
  const xAxisDef = axisDefs[dimMapping.indexOf('x')];
  const yAxisDef = axisDefs[dimMapping.indexOf('y')];

  const config = useComplexConfig();
  const heatmapConfig = useHeatmapConfig({
    scaleType: silxStyle.signalScaleType,
    keepRatio: guessKeepRatio(xAxisDef, yAxisDef),
  });

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
          selection={getSliceSelection(dimMapping)}
          render={(nxValues) => {
            const { signal, axisValues, title } = nxValues;

            return (
              <MappedComplexVis
                value={signal}
                dims={dims}
                dimMapping={dimMapping}
                axisLabels={axisDefs.map((def) => def?.label)}
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
