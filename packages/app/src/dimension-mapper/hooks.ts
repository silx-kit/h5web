import {
  type ArrayShape,
  type Dataset,
  type ScalarShape,
} from '@h5web/shared/hdf5-models';

import { useDataContext } from '../providers/DataProvider';
import { getSliceSelection } from '../vis-packs/core/utils';
import { type DimensionMapping } from './models';

export function useValuesInCache(
  ...datasets: (Dataset<ScalarShape | ArrayShape> | undefined)[]
): (dimMapping: DimensionMapping) => boolean {
  const { valuesStore } = useDataContext();
  return (dimMapping) => {
    const selection = getSliceSelection(dimMapping);
    return datasets.every(
      (dataset) => !dataset || valuesStore.has({ dataset, selection }),
    );
  };
}
