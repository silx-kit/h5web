import {
  type ComplexType,
  type NumericLikeType,
} from '@h5web/shared/hdf5-models';
import { getAssertedValue } from '@h5web/shared/hdf5-utils';
import { type ReactNode } from 'react';

import { useValues } from '../../hooks';
import { type ValuesStoreParams } from '../../providers/models';
import { type NxData, type NxValues } from './models';

interface Props<T extends NumericLikeType | ComplexType> {
  nxData: NxData<T>;
  selection?: string; // for slice-by-slice fetching
  render: (val: NxValues<T>) => ReactNode;
}

function NxValuesFetcher<T extends NumericLikeType | ComplexType>(
  props: Props<T>,
) {
  const { nxData, selection, render } = props;
  const { signalDef, axisDefs, auxDefs, titleDataset } = nxData;

  // 1. Prepare record of defined `{ dataset, selection }` objects for `useValues`
  const datasets: Record<string, ValuesStoreParams> = {
    signal: { dataset: signalDef.dataset, selection },
    ...(titleDataset && { title: { dataset: titleDataset } }),
    ...(signalDef.errorDataset && {
      errors: { dataset: signalDef.errorDataset, selection },
    }),
  };

  // Compute keys from indices so `undefined` gaps can be restored after `useValues`
  auxDefs.forEach((def, i) => {
    datasets[`auxValues-${i}`] = { dataset: def.dataset, selection };
    if (def.errorDataset) {
      datasets[`auxErrors-${i}`] = { dataset: def.errorDataset, selection };
    }
  });

  axisDefs.forEach((def, i) => {
    if (def) {
      datasets[`axisValues-${i}`] = { dataset: def.dataset };
    }
  });

  // 2. Fetch the values
  const values = useValues(datasets);

  // 3. Assert the values again (because the `datasets` record is loosely typed)
  const signal = getAssertedValue(values.signal, signalDef.dataset);
  const title = getAssertedValue(values.title, titleDataset) || signalDef.label;
  const errors = getAssertedValue(values.errors, signalDef.errorDataset);

  // Map over the original definitions arrays to preserve `undefined` gaps
  const auxValues = auxDefs.map((def, i) =>
    getAssertedValue(values[`auxValues-${i}`], def.dataset),
  );
  const auxErrors = auxDefs.map((def, i) =>
    getAssertedValue(values[`auxErrors-${i}`], def.errorDataset),
  );
  const axisValues = axisDefs.map((def, i) =>
    getAssertedValue(values[`axisValues-${i}`], def?.dataset),
  );

  return render({ title, signal, errors, auxValues, auxErrors, axisValues });
}

export default NxValuesFetcher;
