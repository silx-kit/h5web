import { ToggleGroup } from '@h5web/lib';
import type { AxisMapping } from '@h5web/shared/nexus-models';
import type { Axis } from '@h5web/shared/vis-models';

import styles from './DimensionMapper.module.css';
import type { DimensionMapping } from './models';

interface Props {
  axis: Axis;
  axisLabels: AxisMapping<string> | undefined;
  dimMapping: DimensionMapping;
  onChange: (mapperState: DimensionMapping) => void;
}

function AxisMapper(props: Props) {
  const { axis, axisLabels, dimMapping, onChange } = props;
  const selectedDim = dimMapping.indexOf(axis);

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
            const newMapping = [...dimMapping];

            // Invert mappings or reset slicing index of previously selected dimension
            newMapping[selectedDim] =
              typeof dimMapping[newDim] === 'number' ? 0 : dimMapping[newDim];
            newMapping[newDim] = axis; // assign axis to newly selected dimension

            onChange(newMapping);
          }
        }}
      >
        {dimMapping.map((_, i) => (
          <ToggleGroup.Btn
            key={i} // eslint-disable-line react/no-array-index-key
            label={`D${i}`}
            value={i.toString()}
            hint={axisLabels?.[i]}
          />
        ))}
      </ToggleGroup>
    </div>
  );
}

export default AxisMapper;
