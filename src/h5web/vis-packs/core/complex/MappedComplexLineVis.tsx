import type { DimensionMapping } from '../../../dimension-mapper/models';
import shallow from 'zustand/shallow';
import type { H5WebComplex } from '../../../providers/models';
import { usePhaseAmplitudeValues } from './hooks';
import MappedLineVis from '../line/MappedLineVis';
import { ComplexVisType } from './models';
import { useComplexLineConfig } from './lineConfig';

interface Props {
  value: H5WebComplex[];
  dims: number[];
  dimMapping: DimensionMapping;
  title: string;
}

function MappedComplexLineVis(props: Props) {
  const { value, dims, dimMapping, title } = props;

  const { visType } = useComplexLineConfig((state) => state, shallow);

  const { phaseValues, amplitudeValues } = usePhaseAmplitudeValues(value);

  return (
    <MappedLineVis
      value={
        visType === ComplexVisType.Amplitude ? amplitudeValues : phaseValues
      }
      valueLabel={visType}
      dims={dims}
      dimMapping={dimMapping}
      title={title}
    />
  );
}

export default MappedComplexLineVis;
