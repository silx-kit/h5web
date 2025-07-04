import { DimensionMapper, getSliceSelection, ScaleType } from '@h5web/lib';
import { assertGroup, isAxisScaleType } from '@h5web/shared/guards';

import { useDimMappingState } from '../../../dim-mapping-store';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useComplexLineConfig } from '../../core/complex/lineConfig';
import MappedComplexLineVis from '../../core/complex/MappedComplexLineVis';
import { useLineConfig } from '../../core/line/config';
import { type VisContainerProps } from '../../models';
import VisBoundary from '../../VisBoundary';
import { assertComplexNxData } from '../guards';
import { useNxData, useNxValuesCached } from '../hooks';
import NxValuesFetcher from '../NxValuesFetcher';

function NxComplexSpectrumContainer(props: VisContainerProps) {
  const { entity, toolbarContainer } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  assertComplexNxData(nxData);

  const { signalDef, axisDefs, auxDefs, silxStyle } = nxData;
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

  return (
    <>
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
            const { signal, axisValues, auxValues, title } = nxValues;

            return (
              <MappedComplexLineVis
                value={signal}
                valueLabel={signalDef.label}
                auxLabels={auxDefs.map((def) => def.label)}
                auxValues={auxValues}
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
