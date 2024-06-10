import {
  LineVis,
  useCombinedDomain,
  useDomain,
  useDomains,
  useSafeDomain,
  useVisDomain,
} from '@h5web/lib';
import type {
  ArrayShape,
  ArrayValue,
  Dataset,
  NumericLikeType,
} from '@h5web/shared/hdf5-models';
import type { AxisMapping } from '@h5web/shared/nexus-models';
import type { NumArray } from '@h5web/shared/vis-models';
import { createPortal } from 'react-dom';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import { useDataContext } from '../../../providers/DataProvider';
import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import {
  useMappedArray,
  useMappedArrays,
  useSlicedDimsAndMapping,
  useToNumArray,
} from '../hooks';
import { DEFAULT_DOMAIN, formatNumLikeType, getSliceSelection } from '../utils';
import type { LineConfig } from './config';
import LineToolbar from './LineToolbar';

interface Props {
  dataset?: Dataset<ArrayShape, NumericLikeType>;
  value: ArrayValue<NumericLikeType>;
  valueLabel?: string;
  errors?: NumArray;
  auxLabels?: string[];
  auxValues?: NumArray[];
  auxErrors?: (NumArray | undefined)[];
  dims: number[];
  dimMapping: DimensionMapping;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<NumArray>;
  title: string;
  toolbarContainer?: HTMLDivElement | undefined;
  config: LineConfig;
  ignoreValue?: (val: number) => boolean;
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
    dims,
    dimMapping,
    axisLabels,
    axisValues,
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

  const numArray = useToNumArray(value);
  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);

  const hookArgs = [slicedDims, slicedMapping] as const;
  const dataArray = useMappedArray(numArray, ...hookArgs);
  const errorArray = useMappedArray(errors, ...hookArgs);
  const auxArrays = useMappedArrays(auxValues, ...hookArgs);
  const auxErrorsArrays = useMappedArrays(auxErrors, ...hookArgs);

  const dataDomain = useDomain(
    dataArray,
    yScaleType,
    showErrors ? errorArray : undefined,
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
              dataset &&
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
          label: axisLabels?.[xDimIndex],
          value: axisValues?.[xDimIndex],
          scaleType: xScaleType,
        }}
        ordinateLabel={valueLabel}
        title={title}
        dtype={dataset && formatNumLikeType(dataset.type)}
        errorsArray={errorArray}
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
