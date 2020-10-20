import React, { ReactElement } from 'react';
import ScalarVis from './ScalarVis';
import { useDatasetValue } from './shared/hooks';
import { assertDataset } from '../providers/utils';
import { VisContainerProps } from './shared/models';

function ScalarVisContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);

  const value = useDatasetValue(entity.id);
  if (!value) {
    return <></>;
  }

  return <ScalarVis value={value} />;
}

export default ScalarVisContainer;
