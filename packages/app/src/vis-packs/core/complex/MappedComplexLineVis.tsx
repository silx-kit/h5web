import type { H5WebComplex, ScaleType } from '@h5web/shared';
import shallow from 'zustand/shallow';

import type { DimensionMapping } from '../../../dimension-mapper/models';
import MappedLineVis from '../line/MappedLineVis';
import type { AxisMapping } from '../models';
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
}

function MappedComplexLineVis(props: Props) {
  const { value, valueLabel, ...lineProps } = props;

  const { visType } = useComplexLineConfig((state) => state, shallow);

  const { phaseValues, amplitudeValues } = usePhaseAmplitudeValues(value);

  return (
    <MappedLineVis
      value={
        visType === ComplexVisType.Amplitude ? amplitudeValues : phaseValues
      }
      valueLabel={
        valueLabel ? `${valueLabel} (${visType.toLowerCase()})` : visType
      }
      {...lineProps}
    />
  );
}

export default MappedComplexLineVis;
