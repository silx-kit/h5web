import React, { ReactElement } from 'react';
import ScalarVis from '../ScalarVis';
import { useDatasetValue } from './hooks';
import { assertDataset } from '../../providers/utils';
import type { VisContainerProps } from './models';

function ScalarVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);

  const value = useDatasetValue(entity.id);
  if (value === undefined) {
    return <></>;
  }

  return <ScalarVis value={value} />;
}

export default ScalarVisContainer;
