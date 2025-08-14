import { type DimensionMapping } from '@h5web/shared/vis-models';
import { type HTMLAttributes } from 'react';

import AxisMapper from './AxisMapper';
import styles from './DimensionMapper.module.css';
import SlicingSlider from './SlicingSlider';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  dims: number[];
  dimHints?: (string | undefined)[];
  dimMapping: DimensionMapping;
  canSliceFast?: (nextMapping: DimensionMapping) => boolean;
  onChange: (d: DimensionMapping) => void;
}

function DimensionMapper(props: Props) {
  const {
    className,
    dims,
    dimHints,
    dimMapping,
    canSliceFast,
    onChange,
    ...htmlProps
  } = props;
  if (dims.length !== dimMapping.length) {
    throw new Error('Expected dimensions and mapping arrays of same length');
  }

  if (dimMapping.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.mapper} ${className}`} {...htmlProps}>
      <div className={styles.axisMapperWrapper}>
        <div className={styles.dims}>
          <span className={styles.dimsLabel}>
            <abbr title="Number of elements in each dimension">n</abbr>
          </span>
          {dims.map((d, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={i} className={styles.dimSize}>
              {' '}
              {d}
            </span>
          ))}
        </div>
        <AxisMapper
          axis="x"
          dimHints={dimHints}
          dimMapping={dimMapping}
          onChange={onChange}
        />
        <AxisMapper
          axis="y"
          dimHints={dimHints}
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
