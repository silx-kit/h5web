import { LineVis, useCombinedDomain, useDomain, useDomains } from '@h5web/lib';
import {
  type AxisMapping,
  type NumArray,
  type NumArrayDataset,
} from '@h5web/shared';
import { createPortal } from 'react-dom';

import { type DimensionMapping } from '../../../dimension-mapper/models';
import { useDataContext } from '../../../providers/DataProvider';
import {
  useMappedArray,
  useMappedArrays,
  useSlicedDimsAndMapping,
} from '../hooks';
import { type LineConfig } from './config';
import LineToolbar from './LineToolbar';

type HookArgs = [number[], DimensionMapping, boolean];

interface Props {
  dataset?: NumArrayDataset;
  selection?: string | undefined;
  value: NumArray;
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
    selection,
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

  const { yScaleType, xScaleType, curveType, showGrid, autoScale, showErrors } =
    config;

  const [slicedDims, slicedMapping] = useSlicedDimsAndMapping(dims, dimMapping);

  const hookArgs: HookArgs = autoScale
    ? [slicedDims, slicedMapping, autoScale]
    : [dims, dimMapping, autoScale];

  const [dataArray, dataForDomain] = useMappedArray(value, ...hookArgs);
  const [errorArray, errorsForDomain] = useMappedArray(errors, ...hookArgs);
  const [auxArrays, auxForDomain] = useMappedArrays(auxValues, ...hookArgs);
  const [auxErrorsArrays, auxErrorsForDomain] = useMappedArrays(
    auxErrors,
    ...hookArgs
  );

  const dataDomain = useDomain(
    dataForDomain,
    yScaleType,
    showErrors ? errorsForDomain : undefined,
    ignoreValue
  );

  const auxDomains = useDomains(auxForDomain, yScaleType, auxErrorsForDomain);
  const combinedDomain = useCombinedDomain([dataDomain, ...auxDomains]);
  const xDimIndex = dimMapping.indexOf('x');

  const { getExportURL } = useDataContext();

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <LineToolbar
            isSlice={selection !== undefined}
            disableAutoScale={dims.length <= 1} // with 1D datasets, `baseArray` and `dataArray` are the same so auto-scaling is implied
            disableErrors={!errors}
            config={config}
            getExportURL={
              getExportURL &&
              dataset &&
              ((format) => getExportURL(format, dataset, selection, value))
            }
          />,
          toolbarContainer
        )}

      <LineVis
        dataArray={dataArray}
        domain={combinedDomain}
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
        dtype={dataset?.type}
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
