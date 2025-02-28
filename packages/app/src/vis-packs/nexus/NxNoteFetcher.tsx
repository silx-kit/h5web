import {
  type Dataset,
  type ScalarShape,
  type StringType,
} from '@h5web/shared/hdf5-models';
import { type ReactNode } from 'react';

import { useDatasetValues, usePrefetchValues } from '../../hooks';

interface Props {
  dataDataset: Dataset<ScalarShape, StringType>;
  typeDataset: Dataset<ScalarShape, StringType>;
  render: (value: string, mimeType: string) => ReactNode;
}

function NxNoteFetcher(props: Props) {
  const { dataDataset, typeDataset, render } = props;

  usePrefetchValues([dataDataset, typeDataset]);
  const [value, mimeType] = useDatasetValues([dataDataset, typeDataset]);

  return <>{render(value, mimeType)}</>;
}

export default NxNoteFetcher;
