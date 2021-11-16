import type {
  ArrayShape,
  ComplexType,
  Dataset,
  NumericType,
  Value,
} from '@h5web/shared';
import type { ReactNode } from 'react';

import type { DimensionMapping } from '../../dimension-mapper/models';
import { useDatasetValue } from './hooks';
import { getValueSize } from './utils';

const MAX_SIZE = 64_000_000;

interface Props<D extends Dataset> {
  dataset: D;
  dimMapping: DimensionMapping;
  render: (val: Value<D>, isSlice?: boolean) => ReactNode;
}

function LimitedValueFetcher<
  D extends Dataset<ArrayShape, NumericType> | Dataset<ArrayShape, ComplexType>
>(props: Props<D>) {
  const { dataset, dimMapping, render } = props;

  const fetchSlice = getValueSize(dataset) >= MAX_SIZE;

  const value = useDatasetValue(dataset, fetchSlice ? dimMapping : undefined);
  return <>{render(value, fetchSlice)}</>;
}

export default LimitedValueFetcher;
