import { type AxisMapping } from '@h5web/shared/nexus-models';

import AxisMapper from './AxisMapper';
import styles from './DimensionMapper.module.css';
import { type DimensionMapping } from './models';
import SlicingSlider from './SlicingSlider';

interface Props {
  className: string;
  dims: number[];
  axisLabels?: AxisMapping<string>;
  dimMapping: DimensionMapping;
  canSliceFast?: (nextMapping: DimensionMapping) => boolean;
  onChange: (d: DimensionMapping) => void;
}

function DimensionMapper(props: Props) {
  const { className, dims, axisLabels, dimMapping, canSliceFast, onChange } =
    props;
  const mappableDims = dims.slice(0, dimMapping.length);

  if (dimMapping.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.mapper} ${className}`}>
      <div className={styles.axisMapperWrapper}>
        <div className={styles.dims}>
          <span className={styles.dimsLabel}>
            <abbr title="Number of elements in each dimension">n</abbr>
          </span>
          {mappableDims.map((d, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={i} className={styles.dimSize}>
              {' '}
              {d}
            </span>
          ))}
        </div>
        <AxisMapper
          axis="x"
          axisLabels={axisLabels}
          dimMapping={dimMapping}
          onChange={onChange}
        />
        <AxisMapper
          axis="y"
          axisLabels={axisLabels}
          dimMapping={dimMapping}
          onChange={onChange}
        />
      </div>
      <div className={styles.sliders}>
        {dimMapping.map((val, index) =>
          typeof val === 'number' ? (
            <SlicingSlider
              key={index} // eslint-disable-line react/no-array-index-key
              dimension={index}
              length={dims[index]}
              initialValue={val}
              isFastSlice={
                canSliceFast &&
                ((newVal) => {
                  const newMapping = [...dimMapping];
                  newMapping[index] = newVal;
                  return canSliceFast(newMapping);
                })
              }
              onChange={(newVal) => {
                const newMapping = [...dimMapping];
                newMapping[index] = newVal;
                onChange(newMapping);
              }}
            />
          ) : undefined,
        )}
      </div>
    </div>
  );
}

export default DimensionMapper;
