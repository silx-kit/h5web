import {
  ComplexVisType,
  type DimensionMapping,
  LineVis,
  useCombinedDomain,
  useDomains,
  useSafeDomain,
  useSlicedDimsAndMapping,
  useVisDomain,
} from '@h5web/lib';
import {
  type ArrayValue,
  type ComplexType,
  type NumericLikeType,
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';
import { createPortal } from 'react-dom';

import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import { useMappedArrays, useToNumArrays } from '../hooks';
import { type LineConfig } from '../line/config';
import LineToolbar from '../line/LineToolbar';
import { DEFAULT_DOMAIN } from '../utils';
import { usePhaseAmplitudeArrays } from './hooks';
import { COMPLEX_VIS_TYPE_LABELS } from './utils';

interface Props {
  value: ArrayValue<ComplexType>;
  valueLabel?: string;
  auxLabels?: string[];
  auxValues?: ArrayValue<NumericLikeType | ComplexType>[];
  dims: number[];
  dimMapping: DimensionMapping;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<ArrayValue<NumericType>>;
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
  config: LineConfig;
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
  } = props;

  const {
    customDomain,
    yScaleType,
    xScaleType,
    complexVisType,
    showAux,
    showGrid,
    curveType,
  } = config;

  const { phaseArrays, amplitudeArrays } = usePhaseAmplitudeArrays([
    value,
    ...auxValues,
  ]);
  const numAxisArrays = useToNumArrays(axisValues);

  const mappingArgs = useSlicedDimsAndMapping(dims, dimMapping);
  const mappedPhaseArrays = useMappedArrays(phaseArrays, ...mappingArgs);
  const mappedAmplitudeArrays = useMappedArrays(
    amplitudeArrays,
    ...mappingArgs,
  );

  const phaseDomains = useDomains(mappedPhaseArrays, yScaleType);
  const amplitudeDomains = useDomains(mappedAmplitudeArrays, yScaleType);

  const [pickedArrays, pickedDomains] =
    complexVisType === ComplexVisType.Phase
      ? [mappedPhaseArrays, phaseDomains]
      : [mappedAmplitudeArrays, amplitudeDomains];

  const [dataArray, ...auxArrays] = pickedArrays;
  const combinedDomain = useCombinedDomain(pickedDomains) || DEFAULT_DOMAIN;
  const visDomain = useVisDomain(customDomain, combinedDomain);
  const [safeDomain] = useSafeDomain(visDomain, combinedDomain, yScaleType);

  const xDimIndex = dimMapping.indexOf('x');
  const ordinateLabel = valueLabel
    ? `${valueLabel} (${COMPLEX_VIS_TYPE_LABELS[complexVisType].toLowerCase()})`
    : COMPLEX_VIS_TYPE_LABELS[complexVisType];

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <LineToolbar
            dataDomain={combinedDomain}
            isComplex
            withAux={auxValues.length > 0}
            config={config}
          />,
          toolbarContainer,
        )}

      <LineVis
        className={visualizerStyles.vis}
        dataArray={dataArray}
        domain={safeDomain}
        scaleType={yScaleType}
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
        showAux={showAux}
        showGrid={showGrid}
        curveType={curveType}
        testid={dimMapping.toString()}
      />
    </>
  );
}

export default MappedComplexLineVis;
