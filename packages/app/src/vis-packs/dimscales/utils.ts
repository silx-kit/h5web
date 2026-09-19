import {
  assertValue,
  hasArrayShape,
  hasNumericType,
  hasStringType,
  isDataset,
} from '@h5web/shared/guards';
import {
  type ArrayShape,
  type ArrayValue,
  type Dataset,
  type DimensionScales,
  type Entity,
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';

import { type DataContextValue } from '../../providers/DataProvider';
import {
  findAttribute,
  findScalarStrAttr,
  getAttributeValue,
} from '../../utils';

export interface DimScale {
  label?: string;
  value?: ArrayValue<NumericType>; // undefined if the dimension is labelled but has no usable scale
}

interface UsableScale {
  dataset: Dataset<ArrayShape, NumericType>;
  name?: string; // name given to `make_scale`, if any
}

export async function getDimScales(
  dataset: Dataset<ArrayShape>,
  dataContext: DataContextValue,
): Promise<AxisMapping<DimScale>> {
  const { queryClient, queries } = dataContext;
  const { dims } = dataset.shape;

  const [labels, scales] = await Promise.all([
    getDimLabels(dataset, dataContext),
    dataContext.getDimensionScales?.(dataset) ?? [], // providers that can't dereference `DIMENSION_LIST` plot against indices
  ]);

  return Promise.all(
    dims.map(async (dimSize, index) => {
      const label = labels[index];
      const scale = await findUsableScale(
        scales[index] || [],
        dimSize,
        dataContext,
      );

      if (!scale) {
        // A label names the dimension even when no scale is attached
        return label ? { label } : undefined;
      }

      const unit = await getAttributeValue(
        scale.dataset,
        findScalarStrAttr(scale.dataset, 'units'),
        dataContext,
      );

      // The dimension label wins over the scale's own name, as for NeXus `long_name`
      const base = label || scale.name || scale.dataset.name;
      const value = await queryClient.query(queries.value(scale.dataset));
      assertValue(value, scale.dataset);

      return { label: unit ? `${base} (${unit})` : base, value };
    }),
  );
}

export function isUsableScale(
  entity: Entity | undefined,
  dimSize: number,
): entity is Dataset<ArrayShape, NumericType> {
  return (
    !!entity &&
    isDataset(entity) &&
    hasArrayShape(entity) &&
    hasNumericType(entity) &&
    entity.shape.dims.length === 1 &&
    entity.shape.dims[0] === dimSize
  );
}

/* HDF5 allows several scales per dimension, but H5Web can plot only one, so the
 * first usable scale wins: a dimension carrying N+1 bin boundaries next to N
 * bin centres still gets an axis. The spec allows a scale of "any rank and
 * shape" and leaves it "up to the application to interpret or resolve the
 * difference", so an unusable scale falls back to the index axis rather than
 * erroring. */
async function findUsableScale(
  scales: DimensionScales[number],
  dimSize: number,
  dataContext: DataContextValue,
): Promise<UsableScale | undefined> {
  const { queryClient, queries } = dataContext;

  for (const { path, name } of scales) {
    try {
      const entity = await queryClient.query(queries.entity(path)); // eslint-disable-line no-await-in-loop -- stop at first usable scale found

      if (isUsableScale(entity, dimSize)) {
        return { dataset: entity, name };
      }
    } catch {
      // Reference to an unlinked object, say; the dimension falls back to the index axis
    }
  }

  return undefined;
}

/* `DIMENSION_LABELS` is a plain attribute, so a dimension can be named even when
 * no scale is attached. HDF5 writes an empty string for unlabelled dimensions,
 * and may write fewer labels than the dataset has dimensions. */
async function getDimLabels(
  dataset: Dataset<ArrayShape>,
  dataContext: DataContextValue,
): Promise<AxisMapping<string>> {
  const attr = findAttribute(dataset, 'DIMENSION_LABELS');

  const labels =
    attr && hasArrayShape(attr) && hasStringType(attr)
      ? await getAttributeValue(dataset, attr, dataContext)
      : [];

  return dataset.shape.dims.map((_, index) => labels[index] || undefined);
}
