import {
  type DimensionMapping,
  getDomain,
  getSliceSelection,
  KeepZoom,
  LineVis,
  useCombinedDomain,
  useDomain,
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
  useIgnoreValues,
  usePackings,
  useUnpackedNumArray,
} from '../../netcdf/hooks';
import { formatDType, unpackNumArray } from '../../netcdf/utils';
import {
  useExportEntries,
  useMappedArray,
  useMappedArrays,
  useToNumArray,
  useToNumArrays,
} from '../hooks';
import { DEFAULT_DOMAIN, toNumArray } from '../utils';
import { type LineConfig } from './config';
import LineToolbar from './LineToolbar';
import { generateCsv } from './utils';

function ignoreNone(): boolean {
  return false;
}

interface Props {
  dataset: Dataset<ArrayShape, NumericLikeType>;
  value: ArrayValue<NumericLikeType>;
  valueLabel?: string;
  valueVisible?: boolean;
  errors?: ArrayValue<NumericType>;
  errorsDataset?: Dataset<ArrayShape, NumericType>;
  auxLabels?: string[];
  auxValues?: ArrayValue<NumericLikeType | ComplexType>[];
  auxDatasets?: Dataset<ArrayShape, NumericLikeType | ComplexType>[];
  auxErrors?: (ArrayValue<NumericType> | undefined)[];
  auxErrorsDatasets?: (Dataset<ArrayShape, NumericType> | undefined)[];
  auxVisible?: boolean[];
  dimMapping: DimensionMapping;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<ArrayValue<NumericType>>;
  title: string;
  toolbarContainer?: HTMLDivElement | undefined;
  config: LineConfig;
}

function MappedLineVis(props: Props) {
  const {
    dataset,
    value,
    valueLabel,
    valueVisible = true,
    errors,
    errorsDataset,
    auxLabels = [],
    auxValues = [],
    auxDatasets = [],
    auxErrors = [],
    auxErrorsDatasets = [],
    auxVisible = [],
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
    curveType,
    showGrid,
    showErrors,
    interpolation,
  } = config;

  // Each signal is unpacked and checked for invalid values based on its own attributes
  const [ignoreValue, ...auxIgnoreValues] = useIgnoreValues([
    dataset,
    ...auxDatasets,
  ]);
  const [packing, errorsPacking, ...otherPackings] = usePackings([
    dataset,
    errorsDataset,
    ...auxDatasets,
    ...auxErrorsDatasets,
  ]);
  const auxPackings = otherPackings.slice(0, auxDatasets.length);
  const auxErrorsPackings = otherPackings.slice(auxDatasets.length);

  const { dims } = dataset.shape;
  const mappingArgs = useSlicedDimsAndMapping(dims, dimMapping);

  const numArray = useToNumArray(useUnpackedNumArray(value, packing));
  const numAuxArrays = useMemo(
    () =>
      auxValues.map((arr, i) => {
        if (isComplexArray(arr)) {
          return arr.map(([real, imag]) => Math.hypot(real, imag)); // amplitude
        }

        return toNumArray(
          unpackNumArray<ArrayValue<NumericLikeType>>(arr, auxPackings[i]),
        );
      }),
    [...auxValues, ...auxPackings], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const numErrorsArray = useToNumArray(
    useUnpackedNumArray(errors, errorsPacking),
  );
  const numAuxErrorsArrays = useToNumArrays(
    useMemo(
      () =>
        auxErrors.map(
          (arr, i) => arr && unpackNumArray(arr, auxErrorsPackings[i]),
        ),
      [...auxErrors, ...auxErrorsPackings], // eslint-disable-line react-hooks/exhaustive-deps
    ),
  );
  const numAxisArrays = useToNumArrays(axisValues);

  const dataArray = useMappedArray(numArray, ...mappingArgs);
  const errorsArray = useMappedArray(numErrorsArray, ...mappingArgs);
  const auxArrays = useMappedArrays(numAuxArrays, ...mappingArgs);
  const auxErrorsArrays = useMappedArrays(numAuxErrorsArrays, ...mappingArgs);

  const dataDomain = useDomain(dataArray, {
    errors: errorsArray,
    includeErrors: showErrors,
    scaleType: yScaleType,
    ignoreValue,
  });

  const auxDomains = useMemo(
    () =>
      auxArrays.map((arr, i) =>
        getDomain(arr, {
          errors: auxErrorsArrays[i],
          includeErrors: showErrors,
          scaleType: yScaleType,
          ignoreValue: auxIgnoreValues[i],
        }),
      ),
    [auxArrays, auxErrorsArrays, showErrors, yScaleType, ...auxIgnoreValues], // eslint-disable-line react-hooks/exhaustive-deps
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
    ignoreValue: auxIgnoreValues[i] ?? ignoreNone, // don't fall back to signal's `ignoreValue`
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
        dtype={formatDType(dataset.type, packing)}
        errorsArray={errorsArray}
        showErrors={showErrors}
        auxiliaries={auxiliaries}
        ignoreValue={ignoreValue}
        interpolation={interpolation}
        visible={valueVisible}
        testid={dimMapping.toString()}
      >
        <KeepZoom visKey="line" xOnly />
      </LineVis>
    </>
  );
}

export default MappedLineVis;
