import type { ReactElement } from 'react';
import { useDatasetValue } from '../hooks';
import {
  assertDataset,
  assertNumericType,
  assertSimpleShape,
} from '../../../guards';
import MappedLineVis from '../line/MappedLineVis';
import type { VisContainerProps } from '../../models';

function LineVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);
  assertSimpleShape(entity);
  assertNumericType(entity);

  const { name, path, shape } = entity;
  const value = useDatasetValue(path);

  return <MappedLineVis value={value} dims={shape.dims} title={name} />;
}

export default LineVisContainer;
