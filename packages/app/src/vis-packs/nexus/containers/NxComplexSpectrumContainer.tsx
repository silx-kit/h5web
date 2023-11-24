import { ScaleType } from '@h5web/lib';
import { assertGroup, isAxisScaleType } from '@h5web/shared/guards';

import DimensionMapper from '../../../dimension-mapper/DimensionMapper';
import { useDimMappingState } from '../../../dimension-mapper/hooks';
import { useComplexLineConfig } from '../../core/complex/lineConfig';
import MappedComplexLineVis from '../../core/complex/MappedComplexLineVis';
import { useLineConfig } from '../../core/line/config';
import { getSliceSelection } from '../../core/utils';
import type { VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { assertComplexNxData } from '../guards';
import { useNxData } from '../hooks';
import NxValuesFetcher from '../NxValuesFetcher';

function NxComplexSpectrumContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertComplexNxData(nxData);

  const { signalDef, axisDefs, silxStyle } = nxData;
  const signalDims = signalDef.dataset.shape;

  const [dimMapping, setDimMapping] = useDimMappingState(signalDims, 1);

  const axisLabels = axisDefs.map((def) => def?.label);
  const xDimIndex = dimMapping.indexOf('x');

  const config = useComplexLineConfig();
  const lineConfig = useLineConfig({
    xScaleType: silxStyle.axisScaleTypes?.[xDimIndex],
    yScaleType: isAxisScaleType(silxStyle.signalScaleType)
      ? silxStyle.signalScaleType
      : ScaleType.Linear,
  });

  const { autoScale } = lineConfig;

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
          selection={autoScale ? getSliceSelection(dimMapping) : undefined}
          render={(nxValues) => {
            const { signal, axisValues, title } = nxValues;

            return (
              <MappedComplexLineVis
                value={signal}
                valueLabel={signalDef.label}
                dims={signalDims}
                dimMapping={dimMapping}
                axisLabels={axisLabels}
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
