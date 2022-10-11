import { assertGroup } from '@h5web/shared';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import VisBoundary from '../../VisBoundary';
import MappedComplexLineVis from '../../core/complex/MappedComplexLineVis';
import { useComplexLineConfig } from '../../core/complex/lineConfig';
import { useLineConfig } from '../../core/line/config';
import { getSliceSelection } from '../../core/utils';
import type { VisContainerProps } from '../../models';
import NxValuesFetcher from '../NxValuesFetcher';
import { assertComplexNxData } from '../guards';
import { useNxData } from '../hooks';

function NxComplexSpectrumContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertComplexNxData(nxData);
  const { signalDef, axisDefs, silxStyle } = nxData;
  const signalDims = signalDef.dataset.shape;

  const [dimMapping, setDimMapping] = useDimMappingState(signalDims, 1);
  const xDimIndex = dimMapping.indexOf('x');

  const config = useComplexLineConfig();
  const lineConfig = useLineConfig({
    xScaleType: silxStyle.axisScaleTypes?.[xDimIndex],
    yScaleType: silxStyle.signalScaleType,
  });

  const { autoScale } = lineConfig;

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
          selection={autoScale ? getSliceSelection(dimMapping) : undefined}
          render={(nxValues) => {
            const { signal, axisValues, title } = nxValues;

            return (
              <MappedComplexLineVis
                value={signal}
                valueLabel={signalDef.label}
                dims={signalDims}
                dimMapping={dimMapping}
                axisLabels={axisDefs.map((def) => def?.label)}
                axisValues={axisValues}
                title={title}
                toolbarContainer={toolbarContainer}
                config={config}
                lineConfig={lineConfig}
              />
            );
          }}
        />
      </VisBoundary>
    </>
  );
}

export default NxComplexSpectrumContainer;
