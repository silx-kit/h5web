import type {
  ArrayShape,
  Dataset,
  ScalarShape,
  Value,
} from '@h5web/shared/hdf5-models';
import type { ReactNode } from 'react';

import { useDatasetValue } from './hooks';

interface Props<D extends Dataset> {
  dataset: D;
  selection?: string; // for slice-by-slice fetching
  render: (val: Value<D>) => ReactNode;
}

function ValueFetcher<D extends Dataset<ArrayShape | ScalarShape>>(
  props: Props<D>,
) {
  const { dataset, selection, render } = props;

  const value = useDatasetValue(dataset, selection);
  return <>{render(value)}</>;
}

export default ValueFetcher;
