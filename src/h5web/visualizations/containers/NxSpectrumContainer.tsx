import React, { ReactElement, useContext, useEffect } from 'react';
import { assertGroup } from '../../providers/utils';
import MappedLineVis from '../line/MappedLineVis';
import { ProviderContext } from '../../providers/context';
import { findNxDataGroup } from '../nexus/utils';
import type { VisContainerProps } from './models';
import { useNxData } from '../nexus/hooks';
import { assertDefined } from '../shared/utils';
import { useNxSpectrumConfig } from '../nexus/config';

function NxSpectrumContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertGroup(entity);

  const { metadata } = useContext(ProviderContext);
  const nxDataGroup = findNxDataGroup(entity, metadata);
  assertDefined(nxDataGroup, 'Expected to find NXdata group');

  const nxData = useNxData(nxDataGroup, metadata);
  const { signal, title, errors, axisMapping } = nxData;

  const { showErrors, disableErrors } = useNxSpectrumConfig();
  useEffect(() => {
    disableErrors(!errors);
  }, [disableErrors, errors]);

  if (!signal.value) {
    return <></>;
  }

  if (errors && signal.value.length !== errors.length) {
    throw new Error(
      `Error dataset has size ${errors.length} which is different from signal dataset size ${signal.value.length}`
    );
  }

  return (
    <MappedLineVis
      value={signal.value}
      valueLabel={signal.label}
      valueScaleType={signal.scaleType}
      axisMapping={axisMapping}
      dims={nxData.signal.dims}
      title={title || signal.label}
      errors={errors}
      showErrors={showErrors}
    />
  );
}

export default NxSpectrumContainer;
