import { assertScalarValue } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type Dataset,
  type HasType,
  type ScalarShape,
  type ScalarValue,
} from '@h5web/shared/hdf5-models';
import { type ReactNode } from 'react';

import { useDataContext } from '../../../providers/DataProvider';
import { isScalarSelection } from '../utils';

interface Props<D extends Dataset> {
  dataset: D;
  selection?: string;
  render: D extends HasType<infer T>
    ? (val: ScalarValue<T>) => ReactNode
    : never;
}

function ScalarFetcher<D extends Dataset<ScalarShape | ArrayShape>>(
  props: Props<D>,
) {
  const { dataset, selection, render } = props;
  const { valuesStore } = useDataContext();

  if (selection && !isScalarSelection(selection)) {
    throw new Error('Expected scalar selection');
  }

  const value = valuesStore.get({ dataset, selection });
  assertScalarValue(value, dataset.type);

  return render(value);
}

export default ScalarFetcher;
