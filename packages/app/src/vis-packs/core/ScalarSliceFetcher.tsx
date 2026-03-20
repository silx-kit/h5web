import { assertScalarValue } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type Dataset,
  type HasType,
  type ScalarValue,
} from '@h5web/shared/hdf5-models';
import { type ReactNode } from 'react';

import { useDataContext } from '../../providers/DataProvider';
import { isScalarSelection } from './utils';

interface Props<D extends Dataset> {
  dataset: D;
  selection: string;
  render: D extends HasType<infer T>
    ? (val: ScalarValue<T>) => ReactNode
    : never;
}

function ScalarSliceFetcher<D extends Dataset<ArrayShape>>(props: Props<D>) {
  const { dataset, selection, render } = props;
  const { valuesStore } = useDataContext();

  if (!isScalarSelection(selection)) {
    throw new Error('Expected scalar selection');
  }

  const value = valuesStore.get({ dataset, selection });
  assertScalarValue(value, dataset.type);

  return render(value);
}

export default ScalarSliceFetcher;
