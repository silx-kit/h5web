import type { AxisMapping } from '@h5web/shared/nexus-models';
import { isNumber } from 'lodash';

import AxisMapper from './AxisMapper';
import styles from './DimensionMapper.module.css';
import type { DimensionMapping } from './models';
import SlicingSlider from './SlicingSlider';

interface Props {
  rawDims: number[];
  axisLabels?: AxisMapping<string>;
  mapperState: DimensionMapping;
  onChange: (d: DimensionMapping) => void;
}

function DimensionMapper(props: Props) {
  const { rawDims, axisLabels, mapperState, onChange } = props;

  return (
    <div className={styles.mapper}>
      <div className={styles.axisMapperWrapper}>
        <div className={styles.dims}>
          <span className={styles.dimsLabel}>
            <abbr title="Number of elements in each dimension">n</abbr>
          </span>
          {rawDims.map((d, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={`${i}${d}`} className={styles.dimSize}>
              {' '}
              {d}
            </span>
          ))}
        </div>
        <AxisMapper
          axis="x"
          rawDims={rawDims}
          axisLabels={axisLabels}
          mapperState={mapperState}
          onChange={onChange}
        />
        <AxisMapper
          axis="y"
          rawDims={rawDims}
          axisLabels={axisLabels}
          mapperState={mapperState}
          onChange={onChange}
        />
      </div>
      <div className={styles.sliders}>
        {mapperState.map((val, index) =>
          isNumber(val) ? (
            <SlicingSlider
              key={`${index}`} // eslint-disable-line react/no-array-index-key
              dimension={index}
              maxIndex={rawDims[index] - 1}
              initialValue={val}
              onChange={(newVal: number) => {
                const newMapperState = [...mapperState];
                newMapperState[index] = newVal;
                onChange(newMapperState);
              }}
            />
          ) : undefined,
        )}
      </div>
    </div>
  );
}

export default DimensionMapper;
