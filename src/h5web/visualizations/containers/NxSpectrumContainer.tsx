import { ReactElement, useEffect } from 'react';
import { assertGroup } from '../../guards';
import MappedLineVis from '../line/MappedLineVis';
import type { VisContainerProps } from './models';
import { useNxData } from '../nexus/hooks';
import { useNxSpectrumConfig } from '../nexus/config';

function NxSpectrumContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertGroup(entity);

  const nxData = useNxData(entity);
  const { signal, title, errors, axisMapping } = nxData;

  const { showErrors, disableErrors } = useNxSpectrumConfig();
  useEffect(() => {
    disableErrors(!errors);
  }, [disableErrors, errors]);

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
