import {
  type ArrayShape,
  type Dataset,
  type ScalarShape,
  type Value,
} from '@h5web/shared/hdf5-models';
import { type ReactNode } from 'react';

import { useValue } from '../../hooks';
import LargeValueGuard from '../LargeValueGuard';

interface Props<D extends Dataset> {
  dataset: D;
  selection?: string; // for slice-by-slice fetching
  render: (val: Value<D>) => ReactNode;
}

function ValueFetcher<D extends Dataset<ArrayShape | ScalarShape>>(
  props: Props<D>,
) {
  const { dataset, selection } = props;

  return (
    <LargeValueGuard requests={[{ dataset, selection }]}>
      <ValueRenderer {...props} />
    </LargeValueGuard>
  );
}

function ValueRenderer<D extends Dataset<ArrayShape | ScalarShape>>(
  props: Props<D>,
) {
  const { dataset, selection, render } = props;

  const value = useValue(dataset, selection);
  return render(value);
}

export default ValueFetcher;
