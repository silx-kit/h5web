import {
  type IgnoreValue,
  LineVis,
  useCombinedDomain,
  useDomain,
  useDomains,
  useSafeDomain,
  useVisDomain,
} from '@h5web/lib';
import {
  type ArrayShape,
  type ArrayValue,
  type Dataset,
  type NumericLikeType,
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';
import { createPortal } from 'react-dom';

import { type DimensionMapping } from '../../../dimension-mapper/models';
import { useDataContext } from '../../../providers/DataProvider';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import {
  useMappedArray,
  useMappedArrays,
  useSlicedDimsAndMapping,
  useToNumArray,
  useToNumArrays,
} from '../hooks';
import { DEFAULT_DOMAIN, formatNumLikeType, getSliceSelection } from '../utils';
import { type LineConfig } from './config';
import LineToolbar from './LineToolbar';

interface Props {
  dataset: Dataset<ArrayShape, NumericLikeType>;
  value: ArrayValue<NumericLikeType>;
  valueLabel?: string;
  errors?: ArrayValue<NumericType>;
  auxLabels?: string[];
  auxValues?: ArrayValue<NumericLikeType>[];
  auxErrors?: (ArrayValue<NumericType> | undefined)[];
  dimMapping: DimensionMapping;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<ArrayValue<NumericType>>;
  title: string;
  toolbarContainer?: HTMLDivElement | undefined;
  config: LineConfig;
  ignoreValue?: IgnoreValue;
}

function MappedLineVis(props: Props) {
  const {
    dataset,
    value,
    valueLabel,
    errors,
    auxLabels = [],
    auxValues = [],
    auxErrors = [],
    dimMapping,
    axisLabels = [],
    axisValues = [],
    title,
    toolbarContainer,
    config,
    ignoreValue,
  } = props;

  const {
    customDomain,
    yScaleType,
    xScaleType,
    curveType,
    showGrid,
    showErrors,
  } = config;

  const { shape: dims } = dataset;
  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);
  const hookArgs = [slicedDims, slicedMapping] as const;

  const numArray = useToNumArray(value);
  const numAuxArrays = useToNumArrays(auxValues);
  const numErrorsArray = useToNumArray(errors);
  const numAuxErrorsArrays = useToNumArrays(auxErrors);
  const numAxisArrays = useToNumArrays(axisValues);

  const dataArray = useMappedArray(numArray, ...hookArgs);
  const errorsArray = useMappedArray(numErrorsArray, ...hookArgs);
  const auxArrays = useMappedArrays(numAuxArrays, ...hookArgs);
  const auxErrorsArrays = useMappedArrays(numAuxErrorsArrays, ...hookArgs);

  const dataDomain = useDomain(
    dataArray,
    yScaleType,
    showErrors ? errorsArray : undefined,
    ignoreValue,
  );

  const auxDomains = useDomains(auxArrays, yScaleType, auxErrorsArrays);
  const combinedDomain =
    useCombinedDomain([dataDomain, ...auxDomains]) || DEFAULT_DOMAIN;

  const visDomain = useVisDomain(customDomain, combinedDomain);
  const [safeDomain] = useSafeDomain(visDomain, combinedDomain, yScaleType);

  const xDimIndex = dimMapping.indexOf('x');

  const { getExportURL } = useDataContext();
  const selection = getSliceSelection(dimMapping);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <LineToolbar
            dataDomain={combinedDomain}
            isSlice={selection !== undefined}
            disableErrors={!errors}
            config={config}
            getExportURL={
              getExportURL &&
              ((format) => getExportURL(format, dataset, selection, value))
            }
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
        ordinateLabel={valueLabel}
        title={title}
        dtype={formatNumLikeType(dataset.type)}
        errorsArray={errorsArray}
        showErrors={showErrors}
        auxiliaries={auxArrays.map((array, i) => ({
          label: auxLabels[i],
          array,
          errors: auxErrorsArrays[i],
        }))}
        testid={dimMapping.toString()}
        ignoreValue={ignoreValue}
      />
    </>
  );
}

export default MappedLineVis;
