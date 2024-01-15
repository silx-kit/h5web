import { ToggleGroup } from '@h5web/lib';
import type { AxisMapping } from '@h5web/shared/nexus-models';
import type { Axis } from '@h5web/shared/vis-models';
import { isNumber } from 'lodash';

import styles from './DimensionMapper.module.css';
import type { DimensionMapping } from './models';

interface Props {
  axis: Axis;
  rawDims: number[];
  axisLabels: AxisMapping<string> | undefined;
  mapperState: DimensionMapping;
  onChange: (mapperState: DimensionMapping) => void;
}

function AxisMapper(props: Props) {
  const { axis, rawDims, axisLabels, mapperState, onChange } = props;
  const selectedDim = mapperState.indexOf(axis);

  if (selectedDim === -1) {
    return null;
  }

  return (
    <div className={styles.axisMapper}>
      <span className={styles.axisLabel}>{axis}</span>
      <ToggleGroup
        role="radiogroup"
        ariaLabel={`Dimension as ${axis} axis`}
        value={selectedDim.toString()}
        onChange={(val) => {
          const newDim = Number(val);
          if (selectedDim !== newDim) {
            const newMapperState = [...mapperState];

            // Invert mappings or reset slicing index of previously selected dimension
            newMapperState[selectedDim] =
              isNumber(mapperState[newDim]) ? 0 : mapperState[newDim];
            newMapperState[newDim] = axis; // assign axis to newly selected dimension

            onChange(newMapperState);
          }
        }}
      >
        {Object.keys(rawDims).map((dimKey, index) => (
          <ToggleGroup.Btn
            key={dimKey}
            label={`D${dimKey}`}
            value={dimKey}
            hint={axisLabels?.[index]}
          />
        ))}
      </ToggleGroup>
    </div>
  );
}

export default AxisMapper;
