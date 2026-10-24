import { type DimensionMapping } from '@h5web/shared/vis-models';
import { type HTMLAttributes } from 'react';

import AxisMapper from './AxisMapper';
import styles from './DimensionMapper.module.css';
import InertBox from './InertBox';
import SlicingSlider from './SlicingSlider';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  dims: number[];
  dimHints?: (string | undefined)[];
  dimMapping: DimensionMapping;
  withSlicingControls?: boolean;
  defaultStride?: number;
  canSliceFast?: (nextMapping: DimensionMapping) => boolean;
  onChange: (d: DimensionMapping) => void;
  multiDim?: number;
  maxMultiDimLength?: number;
  onMultiDimChange?: (dim: number | undefined) => void; // shows multi-plotting checkboxes when provided
}

function DimensionMapper(props: Props) {
  const {
    className,
    dims,
    dimHints,
    dimMapping,
    withSlicingControls = false,
    defaultStride,
    canSliceFast,
    onChange,
    multiDim,
    maxMultiDimLength = 20,
    onMultiDimChange,
    ...htmlProps
  } = props;
  if (dims.length !== dimMapping.length) {
    throw new Error('Expected dimensions and mapping arrays of same length');
  }

  if (dimMapping.length === 0) {
    return null;
  }

  function handleAxisChange(newMapping: DimensionMapping) {
    onChange(newMapping);

    // Reset multi-plotting dimension if it gets mapped to an axis
    if (multiDim !== undefined && typeof newMapping[multiDim] !== 'number') {
      onMultiDimChange?.(undefined);
    }
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
          onChange={handleAxisChange}
        />
        <AxisMapper
          axis="y"
          dimHints={dimHints}
          dimMapping={dimMapping}
          onChange={handleAxisChange}
        />
      </div>
      <div className={styles.sliders}>
        {dimMapping.map((val, index) => {
          if (typeof val !== 'number') {
            return undefined;
          }

          const slider = (
            <SlicingSlider
              key={index} // eslint-disable-line react/no-array-index-key
              dimension={index}
              length={dims[index]}
              value={val}
              withControls={withSlicingControls}
              defaultStride={defaultStride}
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
          );

          if (!onMultiDimChange) {
            return slider;
          }

          const isMultiDim = multiDim === index;
          const isTooLong = dims[index] > maxMultiDimLength;

          return (
            <div
              key={index} // eslint-disable-line react/no-array-index-key
              className={styles.sliderWrapper}
            >
              {/* Disable slider of multi-plotting dimension */}
              <InertBox className={styles.sliderBox} inert={isMultiDim}>
                {slider}
              </InertBox>
              <label
                className={styles.multiToggle}
                title={
                  isTooLong
                    ? `Too many slices to plot at once (max ${maxMultiDimLength})`
                    : `Plot all D${index} slices`
                }
              >
                <input
                  type="checkbox"
                  aria-label={`Plot all D${index} slices`}
                  checked={isMultiDim}
                  disabled={
                    (multiDim !== undefined && !isMultiDim) || // only one multi-plotting dimension at a time
                    dims[index] <= 1 ||
                    isTooLong
                  }
                  onChange={() => {
                    onMultiDimChange(isMultiDim ? undefined : index);
                  }}
                />
                all
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DimensionMapper;
