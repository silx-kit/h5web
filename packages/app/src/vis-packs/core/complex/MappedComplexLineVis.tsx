import type { H5WebComplex, ScaleType } from '@h5web/shared';
import { createPortal } from 'react-dom';
import shallow from 'zustand/shallow';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import MappedLineVis from '../line/MappedLineVis';
import type { AxisMapping } from '../models';
import ComplexLineToolbar from './ComplexLineToolbar';
import { usePhaseAmplitudeValues } from './hooks';
import { useComplexLineConfig } from './lineConfig';
import { ComplexVisType } from './models';

interface Props {
  value: H5WebComplex[];
  valueLabel?: string;
  valueScaleType?: ScaleType;
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title: string;
  toolbarContainer: HTMLDivElement | undefined;
}

function MappedComplexLineVis(props: Props) {
  const { value, valueLabel, toolbarContainer, ...lineProps } = props;
  const { valueScaleType, dims, dimMapping, axisMapping = [] } = lineProps;

  const { visType } = useComplexLineConfig((state) => state, shallow);

  const { phaseValues, amplitudeValues } = usePhaseAmplitudeValues(value);

  return (
    <>
      {toolbarContainer &&
        createPortal(
          <ComplexLineToolbar
            initialXScaleType={axisMapping[dimMapping.indexOf('x')]?.scaleType}
            initialYScaleType={valueScaleType}
            disableAutoScale={dims.length <= 1} // with 1D datasets, `baseArray` and `dataArray` are the same so auto-scaling is implied
          />,
          toolbarContainer
        )}

      <MappedLineVis
        value={
          visType === ComplexVisType.Amplitude ? amplitudeValues : phaseValues
        }
        valueLabel={
          valueLabel ? `${valueLabel} (${visType.toLowerCase()})` : visType
        }
        {...lineProps}
      />
    </>
  );
}

export default MappedComplexLineVis;
