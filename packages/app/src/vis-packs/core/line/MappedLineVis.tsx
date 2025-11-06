import {
  type DimensionMapping,
  getSliceSelection,
  type IgnoreValue,
  LineVis,
  useCombinedDomain,
  useDomain,
  useDomains,
  useSafeDomain,
  useSlicedDimsAndMapping,
  useVisDomain,
} from '@h5web/lib';
import { isComplexArray } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type ArrayValue,
  type ComplexType,
  type Dataset,
  type NumericLikeType,
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';
import { useMemo } from 'react';
import { createPortal } from 'react-dom';

import visualizerStyles from '../../../visualizer/Visualizer.module.css';
import {
  useExportEntries,
  useMappedArray,
  useMappedArrays,
  useToNumArray,
  useToNumArrays,
} from '../hooks';
import { DEFAULT_DOMAIN, formatNumLikeType, toNumArray } from '../utils';
import { type LineConfig } from './config';
import LineToolbar from './LineToolbar';
import { generateCsv } from './utils';

interface Props {
  dataset: Dataset<ArrayShape, NumericLikeType>;
  value: ArrayValue<NumericLikeType>;
  valueLabel?: string;
  valueVisible?: boolean;
  errors?: ArrayValue<NumericType>;
  auxLabels?: string[];
  auxValues?: ArrayValue<NumericLikeType | ComplexType>[];
  auxErrors?: (ArrayValue<NumericType> | undefined)[];
  auxVisible?: boolean[];
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
    valueVisible = true,
    errors,
    auxLabels = [],
    auxValues = [],
    auxErrors = [],
    auxVisible = [],
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
    interpolation,
  } = config;

  const { shape: dims } = dataset;
  const mappingArgs = useSlicedDimsAndMapping(dims, dimMapping);

  const numArray = useToNumArray(value);
  const numAuxArrays = useMemo(
    () =>
      auxValues.map((arr) => {
        if (isComplexArray(arr)) {
          return arr.map(([real, imag]) => Math.hypot(real, imag)); // amplitude
        }

        return toNumArray(arr);
      }),
    auxValues, // eslint-disable-line react-hooks/exhaustive-deps
  );

  const numErrorsArray = useToNumArray(errors);
  const numAuxErrorsArrays = useToNumArrays(auxErrors);
  const numAxisArrays = useToNumArrays(axisValues);

  const dataArray = useMappedArray(numArray, ...mappingArgs);
  const errorsArray = useMappedArray(numErrorsArray, ...mappingArgs);
  const auxArrays = useMappedArrays(numAuxArrays, ...mappingArgs);
  const auxErrorsArrays = useMappedArrays(numAuxErrorsArrays, ...mappingArgs);

  const dataDomain = useDomain(
    dataArray,
    yScaleType,
    showErrors ? errorsArray : undefined,
    ignoreValue,
  );

  const auxDomains = useDomains(
    auxArrays,
    yScaleType,
    showErrors ? auxErrorsArrays : undefined,
  );

  const combinedDomain =
    useCombinedDomain([
      valueVisible ? dataDomain : undefined,
      ...auxDomains.filter((_, i) => auxVisible[i]),
    ]) || DEFAULT_DOMAIN;

  const visDomain = useVisDomain(customDomain, combinedDomain);
  const [safeDomain] = useSafeDomain(visDomain, combinedDomain, yScaleType);

  const selection = getSliceSelection(dimMapping);
  const xDimIndex = dimMapping.indexOf('x');

  const abscissaParams = {
    label: axisLabels[xDimIndex],
    value: numAxisArrays[xDimIndex],
    scaleType: xScaleType,
  };

  const auxiliaries = auxArrays.map((array, i) => ({
    label: auxLabels[i],
    array,
    errors: auxErrorsArrays[i],
    visible: auxVisible[i],
  }));

  const exportEntries = useExportEntries(['npy', 'csv'], dataset, selection, {
    csv: () =>
      generateCsv(
        valueLabel || dataset.name,
        dataArray,
        abscissaParams,
        errorsArray,
        auxiliaries,
      ),
  });

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <LineToolbar
            dataDomain={combinedDomain}
            isSlice={selection !== undefined}
            withErrors={!!errors}
            config={config}
            exportEntries={exportEntries}
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
        abscissaParams={abscissaParams}
        ordinateLabel={valueLabel}
        title={title}
        dtype={formatNumLikeType(dataset.type)}
        errorsArray={errorsArray}
        showErrors={showErrors}
        auxiliaries={auxiliaries}
        testid={dimMapping.toString()}
        ignoreValue={ignoreValue}
        interpolation={interpolation}
        visible={valueVisible}
      />
    </>
  );
}

export default MappedLineVis;
