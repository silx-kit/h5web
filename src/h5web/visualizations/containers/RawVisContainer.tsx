import React, { ReactElement } from 'react';
import RawVis from '../RawVis';
import type { VisContainerProps } from './models';
import { useDatasetValue } from './hooks';
import { assertMyDataset } from '../../providers/utils';

function RawViscontainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertMyDataset(entity);

  const value = useDatasetValue(entity.id);
  if (value === undefined) {
    return <></>;
  }

  return <RawVis value={value} />;
}

export default RawViscontainer;
