import { type DimensionMapping } from '@h5web/lib';
import { createMemo } from '@h5web/shared/createMemo';
import {
  type ComplexType,
  type GroupWithChildren,
  type NumericLikeType,
  type Dataset,
  type ArrayShape,
} from '@h5web/shared/hdf5-models';

import { useValuesInCache } from '../../hooks';
import { useDataContext } from '../../providers/DataProvider';
import { type DatasetDef, type NxData } from './models';
import {
  assertNxDataGroup,
  findAuxErrorDataset,
  findErrorDataset,
  findSignalDataset,
  findAxesDatasets,
  findAuxiliaryDatasets,
  findTitleDataset,
  getDatasetInfo,
  getDefaultSlice,
  getSilxStyle,
  resolveNxEntity,
  parseSignalExpression,
  applyExpressionToLabel,
} from './utils';
import { buildEntityPath, getChildEntity } from '@h5web/shared/hdf5-utils';
import {
  assertDefined,
  assertDataset,
  assertArrayShape,
  assertNumericLikeOrComplexType,
  assertNumericType,
  assertStr,
} from '@h5web/shared/guards';

export const useDefaultSlice = createMemo(getDefaultSlice);

export function useNxData(group: GroupWithChildren): NxData {
  const { entitiesStore, attrValuesStore } = useDataContext();

  assertNxDataGroup(group, attrValuesStore);

  // Resolve signal (supports nested paths)
  const rawSignal = attrValuesStore.getSingle(group, 'signal');
  const parsedSignalExpr = typeof rawSignal === 'string' ? parseSignalExpression(rawSignal) : undefined;
  const signalNameToResolve = parsedSignalExpr ? parsedSignalExpr.baseName : (typeof rawSignal === 'string' ? rawSignal : undefined);
  const signalEnt =
    typeof signalNameToResolve === 'string'
      ? resolveNxEntity(group, signalNameToResolve, entitiesStore)
      : undefined;
  const signalDataset: Dataset<ArrayShape, NumericLikeType | ComplexType> =
    (signalEnt as any) || findSignalDataset(group, attrValuesStore, entitiesStore);

  // Resolve axes: prefer group 'axes' attribute, otherwise old-style on signal
  const rawAxesAttr =
    attrValuesStore.getSingle(group, 'axes') ||
    (signalDataset ? attrValuesStore.getSingle(signalDataset, 'axes') : undefined);

  const axisDatasets = findAxesDatasets(
    group,
    signalDataset,
    attrValuesStore,
    entitiesStore,
  );

  // Resolve auxiliary signals (support nested paths)
  const auxSignals = findAuxiliaryDatasets(
    group,
    attrValuesStore,
    entitiesStore,
  );

  return {
    titleDataset: findTitleDataset(group),
    // compute base dataset info and augment label with expression when present
    signalDef: (() => {
      const baseInfo = getDatasetInfo(signalDataset, attrValuesStore);
      const transform = parsedSignalExpr
        ? { expression: parsedSignalExpr.expression }
        : undefined;
      // Determine display suffix from the raw signal attribute so we keep
      // parentheses and chained operations exactly as the user wrote them.
      const displaySuffix =
        parsedSignalExpr && typeof rawSignal === 'string'
          ? rawSignal.slice(rawSignal.indexOf(parsedSignalExpr.baseName) + parsedSignalExpr.baseName.length)
          : undefined;

      return {
        dataset: signalDataset,
        errorDataset: findErrorDataset(group, signalDataset.name),
        ...baseInfo,
        ...(transform ? { transform } : {}),
        ...(transform ? { expr: transform.expression } : {}),
        label: displaySuffix ? `${baseInfo.label} ${displaySuffix}` : baseInfo.label,
      } as DatasetDef;
    })(),
    auxDefs: auxSignals.map((auxSignal) => ({
      dataset: auxSignal,
      errorDataset: findAuxErrorDataset(group, auxSignal.name),
      ...getDatasetInfo(auxSignal, attrValuesStore),
    })),
    axisDefs: axisDatasets.map(
      (dataset) => dataset && { dataset, ...getDatasetInfo(dataset, attrValuesStore) },
    ),
    defaultSlice: useDefaultSlice(group, signalDataset.shape, attrValuesStore),
    silxStyle: getSilxStyle(group, attrValuesStore),
  };
}

export function useNxHeatmapDataToFetch<
  T extends NumericLikeType | ComplexType,
>(nxData: NxData<T>, selectedDef: DatasetDef<T>): NxData<T> {
  const { signalDef, titleDataset } = nxData;

  return {
    ...nxData,
    signalDef: selectedDef,
    auxDefs: [], // fetch selected signal only
    titleDataset:
      selectedDef.dataset === signalDef.dataset
        ? titleDataset
        : // when auxiliary signal is selected, don't fetch title dataset (i.e. use the auxiliary's label as title)
          undefined,
  };
}

export function useNxValuesCached(
  nxData: NxData,
): (dimMapping: DimensionMapping) => boolean {
  const { signalDef, auxDefs } = nxData;

  return useValuesInCache(
    signalDef.dataset,
    signalDef.errorDataset,
    ...auxDefs.flatMap((def) => [def.dataset, def.errorDataset]),
  );
}
