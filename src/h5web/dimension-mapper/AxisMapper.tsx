import { isNumber } from 'lodash';
import ToggleGroup from '../toolbar/controls/ToggleGroup';
import styles from './DimensionMapper.module.css';
import type { Axis, DimensionMapping } from './models';

interface Props {
  axis: Axis;
  rawDims: number[];
  mapperState: DimensionMapping;
  onChange: (mapperState: DimensionMapping) => void;
}

function AxisMapper(props: Props) {
  const { axis, rawDims, mapperState, onChange } = props;
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
            newMapperState[selectedDim] = isNumber(mapperState[newDim])
              ? 0
              : mapperState[newDim];
            newMapperState[newDim] = axis; // assign axis to newly selected dimension

            onChange(newMapperState);
          }
        }}
      >
        {Object.keys(rawDims).map((dimKey) => (
          <ToggleGroup.Btn key={dimKey} label={`D${dimKey}`} value={dimKey} />
        ))}
      </ToggleGroup>
    </div>
  );
}

export default AxisMapper;
