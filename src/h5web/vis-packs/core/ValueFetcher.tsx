import type { ReactNode } from 'react';
import type { DimensionMapping } from '../../dimension-mapper/models';
import type { Dataset, Value } from '../../providers/models';
import { useDatasetValue } from './hooks';

interface Props<D extends Dataset> {
  dataset: D;
  dimMapping?: DimensionMapping; // for slice-by-slice fetching
  render: (val: Value<D>) => ReactNode;
}

function ValueFetcher<D extends Dataset>(props: Props<D>) {
  const { dataset, dimMapping, render } = props;

  const value = useDatasetValue(dataset, dimMapping);
  return <>{render(value)}</>;
}

export default ValueFetcher;
