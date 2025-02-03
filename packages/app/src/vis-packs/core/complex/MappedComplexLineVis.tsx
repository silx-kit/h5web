import {
  LineVis,
  useCombinedDomain,
  useDomain,
  useDomains,
  useSafeDomain,
  useVisDomain,
} from '@h5web/lib';
import {
  type ArrayValue,
  type ComplexType,
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';
import { createPortal } from 'react-dom';

import { type DimensionMapping } from '../../../dimension-mapper/models';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useToNumArrays } from '../hooks';
import { type LineConfig } from '../line/config';
import { DEFAULT_DOMAIN } from '../utils';
import ComplexLineToolbar from './ComplexLineToolbar';
import { useMappedComplexArrays } from './hooks';
import { type ComplexLineConfig } from './lineConfig';
import { COMPLEX_VIS_TYPE_LABELS } from './utils';

interface Props {
  value: ArrayValue<ComplexType>;
  valueLabel?: string;
  auxLabels?: string[];
  auxValues?: ArrayValue<ComplexType>[];
  dims: number[];
  dimMapping: DimensionMapping;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<ArrayValue<NumericType>>;
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
  config: ComplexLineConfig;
  lineConfig: LineConfig;
}

function MappedComplexLineVis(props: Props) {
  const {
    value,
    valueLabel,
    auxLabels = [],
    auxValues = [],
    dims,
    dimMapping,
    axisLabels = [],
    axisValues = [],
    title,
    toolbarContainer,
    config,
    lineConfig,
  } = props;

  const { visType } = config;
  const { customDomain, yScaleType, xScaleType, curveType, showGrid } =
    lineConfig;

  const numAxisArrays = useToNumArrays(axisValues);
  const [dataArray, ...auxArrays] = useMappedComplexArrays(
    [value, ...auxValues],
    dims,
    dimMapping,
    visType,
  );

  const dataDomain = useDomain(dataArray, yScaleType);
  const auxDomains = useDomains(auxArrays, yScaleType);
  const combinedDomain =
    useCombinedDomain([dataDomain, ...auxDomains]) || DEFAULT_DOMAIN;

  const visDomain = useVisDomain(customDomain, combinedDomain);
  const [safeDomain] = useSafeDomain(visDomain, combinedDomain, yScaleType);

  const xDimIndex = dimMapping.indexOf('x');
  const ordinateLabel = valueLabel
    ? `${valueLabel} (${COMPLEX_VIS_TYPE_LABELS[visType].toLowerCase()})`
    : COMPLEX_VIS_TYPE_LABELS[visType];

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <ComplexLineToolbar
            dataDomain={combinedDomain}
            config={config}
            lineConfig={lineConfig}
          />,
          toolbarContainer,
        )}

      <LineVis
        className={visualizerStyles.vis}
        dataArray={dataArray}
        domain={safeDomain}
        scaleType={yScaleType}
        curveType={curveType}
        showGrid={showGrid}
        abscissaParams={{
          label: axisLabels[xDimIndex],
          value: numAxisArrays[xDimIndex],
          scaleType: xScaleType,
        }}
        ordinateLabel={ordinateLabel}
        title={title}
        auxiliaries={auxArrays.map((array, i) => ({
          label: auxLabels[i],
          array,
        }))}
        testid={dimMapping.toString()}
      />
    </>
  );
}

export default MappedComplexLineVis;
