import { hasArrayShape } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type ArrayValue,
  type Dataset,
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';

import { useDataContext } from '../../providers/DataProvider';
import {
  findAttribute,
  findScalarStrAttr,
  getAttributeValue,
  hasAttribute,
} from '../../utils';
import { useNxValues, usePrefetchNxValues } from '../nexus/hooks';
import { type DimScaleDef } from './models';
import {
  getDimensionLabels,
  getScaleLabel,
  isUsableScale,
  tryFetch,
} from './utils';

/* Read the dataset's `DIMENSION_LABELS` attribute, which names each dimension
 * even when no scale is attached. */
export function useDimLabels(
  dataset: Dataset<ArrayShape>,
): AxisMapping<string> {
  const { attrValuesStore } = useDataContext();
  const { dims } = dataset.shape;

  const labelsAttr = findAttribute(dataset, 'DIMENSION_LABELS');
  const labels =
    labelsAttr && hasArrayShape(labelsAttr)
      ? getAttributeValue(dataset, labelsAttr, attrValuesStore)
      : undefined;

  return getDimensionLabels(labels, dims.length);
}

/* Resolve a dataset's HDF5 dimension scales into one definition per dimension:
 * a label and, when a usable scale is attached, the scale dataset to plot
 * against. Suspends, and must be called from the vis container rather than under
 * a `VisBoundary`, so that no loader is mounted while `useDimScaleValues`
 * prefetches - see the note there. This mirrors how the NeXus pack resolves its
 * metadata in the container and fetches values under the boundary. */
export function useDimScaleDefs(
  dataset: Dataset<ArrayShape>,
  dimLabels: AxisMapping<string>,
): AxisMapping<DimScaleDef> {
  const { dimScalesStore, entitiesStore, attrValuesStore } = useDataContext();
  const { dims } = dataset.shape;

  /* Plotting against indices is the documented fallback, so a provider that
   * fails to resolve the scales leaves the dataset viewable rather than broken.
   * Datasets without `DIMENSION_LIST` have no scales to resolve, so they skip
   * the provider round trip entirely - the common case. */
  const dimScales = hasAttribute(dataset, 'DIMENSION_LIST')
    ? tryFetch(() => dimScalesStore?.get(dataset))
    : undefined;

  // Prefetch every candidate scale's metadata so the dimensions resolve in parallel
  dimScales?.flat().forEach((scale) => {
    entitiesStore.prefetch(scale.path);
  });

  const scales = dims.map((dimSize, index) =>
    (dimScales?.[index] || [])
      .map((scale) => ({
        name: scale.name,
        dataset: tryFetch(() => entitiesStore.get(scale.path)),
      }))
      .find(({ dataset: entity }) => isUsableScale(entity, dimSize)),
  );

  /* Prefetch the scales' attributes together too, so that a dataset with a
   * scale on every dimension doesn't pay one round trip per dimension */
  scales.forEach((scale) => {
    if (scale?.dataset) {
      attrValuesStore.prefetch(scale.dataset);
    }
  });

  return dims.map((dimSize, index) => {
    const label = dimLabels[index];
    const scale = scales[index];

    // A label without a usable scale still names the dimension
    if (!scale || !isUsableScale(scale.dataset, dimSize)) {
      return label ? { label } : undefined;
    }

    const scaleDataset = scale.dataset;
    const unitsAttr = findScalarStrAttr(scaleDataset, 'units');
    const units = tryFetch(() =>
      getAttributeValue(scaleDataset, unitsAttr, attrValuesStore),
    );

    return {
      label: getScaleLabel(label, scale.name, scaleDataset.name, units),
      dataset: scaleDataset,
    };
  });
}

/* Fetch the values of the resolved scale datasets. Suspends, so call under a
 * `VisBoundary`. */
export function useDimScaleValues(
  defs: AxisMapping<DimScaleDef>,
): AxisMapping<ArrayValue<NumericType>> {
  const datasets = defs.map((def) => def?.dataset);

  /* Every scale must be requested before the first `get` suspends. Prefetching
   * afterwards would set the store's progress state while the boundary's loader
   * is already mounted and subscribed to it, which React reports as updating one
   * component while rendering another. */
  usePrefetchNxValues(datasets);

  return useNxValues(datasets);
}
