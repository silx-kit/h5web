import React, { ReactElement, useState, useContext, useEffect } from 'react';
import { range } from 'lodash-es';
import { assertGroup } from '../../providers/utils';
import DimensionMapper from '../../dimension-mapper/DimensionMapper';
import { DimensionMapping } from '../../dimension-mapper/models';
import MappedLineVis from '../line/MappedLineVis';
import { ProviderContext } from '../../providers/context';
import { getNxDataGroup } from '../nexus/utils';
import { VisContainerProps } from './models';
import { useNxData } from '../nexus/hooks';
import { useNxSpectrumConfig } from '../nexus/config';

function NxSpectrumContainer(props: VisContainerProps): ReactElement {
  const { entity } = props;
  assertGroup(entity);

  const { metadata } = useContext(ProviderContext);

  const nxDataGroup = getNxDataGroup(entity, metadata);
  if (!nxDataGroup) {
    throw new Error('NXdata group not found');
  }

  const nxData = useNxData(nxDataGroup, metadata);

  const { dims } = nxData.signal;
  if (dims.length === 0) {
    throw new Error('Expected dataset with at least one dimension');
  }

  const [dimensionMapping, setDimensionMapping] = useState<DimensionMapping>([
    ...range(dims.length - 1).fill(0),
    'x',
  ]);

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
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimensionMapping}
        onChange={setDimensionMapping}
      />
      <MappedLineVis
        value={signal.value}
        valueLabel={signal.label}
        valueScaleType={signal.scaleType}
        axisMapping={axisMapping}
        dims={dims}
        dimensionMapping={dimensionMapping}
        title={title || signal.label}
        errors={errors}
        showErrors={showErrors}
      />
    </>
  );
}

export default NxSpectrumContainer;
