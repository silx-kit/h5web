import { type ArrayShape, type Dataset } from '@h5web/shared/hdf5-models';
import { type AxisMapping } from '@h5web/shared/nexus-models';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useDataContext } from '../../providers/DataProvider';
import { type DimScale, getDimScales } from './utils';

/* Resolve the HDF5 dimension scales attached to a dataset's dimensions into an
 * axis label and, where a usable scale is attached, the values to plot against.
 * NeXus metadata takes precedence, so this is used by the core vis pack only.
 * See https://support.hdfgroup.org/documentation/hdf5/latest/_h5_d_s__u_g.html */
export function useDimScales(
  dataset: Dataset<ArrayShape>,
): AxisMapping<DimScale> {
  const dataContext = useDataContext();

  return useSuspenseQuery({
    queryKey: [dataContext.filepath, 'dimScales', dataset.path],
    queryFn: async () => getDimScales(dataset, dataContext),
  }).data;
}
