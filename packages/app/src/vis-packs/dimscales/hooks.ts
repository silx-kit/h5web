import {
  type ArrayShape,
  type ArrayValue,
  type Dataset,
  type NumericType,
} from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useDataContext } from '../../providers/DataProvider';
import { getDimScales } from './utils';

interface DimScaleAxes {
  axisLabels: AxisMapping<string>;
  axisValues: AxisMapping<ArrayValue<NumericType>>;
}

/* Resolve the HDF5 dimension scales attached to a dataset's dimensions into
 * axis labels and, where a usable scale is attached, the values to plot against.
 * NeXus metadata takes precedence, so this is used by the core vis pack only.
 * See https://support.hdfgroup.org/documentation/hdf5/latest/_h5_d_s__u_g.html */
export function useDimScales(dataset: Dataset<ArrayShape>): DimScaleAxes {
  const dataContext = useDataContext();

  const dimScales = useSuspenseQuery({
    queryKey: [dataContext.filepath, 'dimScales', dataset.path],
    queryFn: async () => getDimScales(dataset, dataContext),
  }).data;

  return {
    axisLabels: dimScales.map((scale) => scale?.label),
    axisValues: dimScales.map((scale) => scale?.value),
  };
}
