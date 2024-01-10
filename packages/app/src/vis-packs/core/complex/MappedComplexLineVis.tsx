import type { H5WebComplex } from '@h5web/shared/hdf5-models';
import type { AxisMapping } from '@h5web/shared/nexus-models';
import type { NumArray } from '@h5web/shared/vis-models';
import { useMemo } from 'react';
import { createPortal } from 'react-dom';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import type { LineConfig } from '../line/config';
import MappedLineVis from '../line/MappedLineVis';
import ComplexLineToolbar from './ComplexLineToolbar';
import type { ComplexLineConfig } from './lineConfig';
import { ComplexVisType } from './models';
import { getPhaseAmplitudeValues } from './utils';

interface Props {
  value: H5WebComplex[];
  valueLabel?: string;
  dims: number[];
  dimMapping: DimensionMapping;
  axisLabels?: AxisMapping<string>;
  axisValues?: AxisMapping<NumArray>;
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
  config: ComplexLineConfig;
  lineConfig: LineConfig;
}

function MappedComplexLineVis(props: Props) {
  const {
    value,
    valueLabel,
    toolbarContainer,
    config,
    lineConfig,
    ...lineProps
  } = props;

  const { dims } = lineProps;
  const { visType } = config;

  const { phaseValues, amplitudeValues } = useMemo(
    () => getPhaseAmplitudeValues(value),
    [value],
  );

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <ComplexLineToolbar
            disableAutoScale={dims.length <= 1} // with 1D datasets, `baseArray` and `dataArray` are the same so auto-scaling is implied
            config={config}
            lineConfig={lineConfig}
          />,
          toolbarContainer,
        )}

      <MappedLineVis
        value={
          visType === ComplexVisType.Amplitude ? amplitudeValues : phaseValues
        }
        valueLabel={
          valueLabel ? `${valueLabel} (${visType.toLowerCase()})` : visType
        }
        config={lineConfig}
        {...lineProps}
      />
    </>
  );
}

export default MappedComplexLineVis;
