import React, { ReactElement } from 'react';
import RawVis from './RawVis';
import { VisContainerProps } from './shared/models';
import { useDatasetValue } from './shared/hooks';
import { assertDataset } from '../providers/utils';

function RawViscontainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertDataset(entity);

  const value = useDatasetValue(entity.id);
  if (!value) {
    return <></>;
  }

  return <RawVis value={value} />;
}

export default RawViscontainer;
