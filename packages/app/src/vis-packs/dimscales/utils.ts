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
  type Entity,
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';
import { CancelledError } from '@tanstack/react-query';

import { type DataContextValue } from '../../providers/DataProvider';
import { FetcherError } from '../../providers/utils';
import {
  findAttribute,
  findScalarStrAttr,
  getAttributeValue,
} from '../../utils';

export interface DimScale {
  label?: string;
  value?: ArrayValue<NumericType>; // undefined if the dimension is labelled but has no usable scale
  unit?: string; // scale's `units` attribute, to guess whether to keep the ratio
}

interface UsableScale {
  dataset: Dataset<ArrayShape, NumericType>;
  value: ArrayValue<NumericType>;
}

export async function getDimScales(
  dataset: Dataset<ArrayShape>,
  dataContext: DataContextValue,
): Promise<AxisMapping<DimScale>> {
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

      const { dataset: scaleDataset, value } = scale;
      const { name, unit } = await getScaleMeta(scaleDataset, dataContext);

      // The dimension label wins over the scale's own name, as for NeXus `long_name`
      const base = label || name || scaleDataset.name;

      return {
        label: unit ? `${base} (${unit})` : base,
        value,
        unit,
      };
    }),
  );
}

/* `NAME` is the name given to `make_scale`, empty if none was. Both attributes
 * are optional, so failing to read them must not hide an otherwise usable scale. */
async function getScaleMeta(
  scaleDataset: Dataset<ArrayShape, NumericType>,
  dataContext: DataContextValue,
): Promise<{ name?: string; unit?: string }> {
  try {
    const [name, unit] = await Promise.all([
      getAttributeValue(
        scaleDataset,
        findScalarStrAttr(scaleDataset, 'NAME'),
        dataContext,
      ),
      getAttributeValue(
        scaleDataset,
        findScalarStrAttr(scaleDataset, 'units'),
        dataContext,
      ),
    ]);
    return { name, unit: unit || undefined };
  } catch {
    return {};
  }
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
  scalePaths: string[],
  dimSize: number,
  dataContext: DataContextValue,
): Promise<UsableScale | undefined> {
  const { queryClient, queries } = dataContext;

  /* eslint-disable no-await-in-loop -- stop at first usable scale found */
  for (const path of scalePaths) {
    try {
      const entity = await queryClient.query(queries.entity(path));

      if (isUsableScale(entity, dimSize)) {
        const value = await queryClient.query(queries.value(entity));
        assertValue(value, entity);
        return { dataset: entity, value };
      }
    } catch (error) {
      /* A failed or cancelled fetch says nothing about the scale: falling back
       * to the index axis would plot the wrong axis, and cache it. */
      if (error instanceof CancelledError) {
        throw new CancelledError(); // drop `silent`/`revert` flags, meant for the scale's own query, else this query hangs
      }
      if (isTransportError(error)) {
        throw error;
      }

      // Unlinked or unreadable scale, say: try the next one, else fall back to the index axis
    }
  }
  /* eslint-enable no-await-in-loop */

  return undefined;
}

const TRANSPORT_ERROR_NAMES = new Set([
  'AbortError',
  'TimeoutError',
  'NetworkError',
  'AxiosError', // errors with a response are wrapped in `FetcherError`
]);

// `fetch` rejects with a `TypeError` on network failure, with these messages in Chromium, Firefox and Safari
const FETCH_ERROR_MESSAGES = new Set([
  'Failed to fetch',
  'NetworkError when attempting to fetch resource.',
  'Load failed',
]);

/* Whether fetching failed (incl. fetching a compression plugin), as opposed to
 * HDF5 reporting a missing or unreadable scale. Names are matched as they survive
 * worker boundaries. Other `TypeError`s are not transport errors (e.g. providers
 * throw one for missing entities). */
export function isTransportError(error: unknown): boolean {
  return (
    error instanceof FetcherError || // server error not recognised as an HDF5 error by the provider
    (error instanceof TypeError && FETCH_ERROR_MESSAGES.has(error.message)) ||
    (error instanceof Error && TRANSPORT_ERROR_NAMES.has(error.name))
  );
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
