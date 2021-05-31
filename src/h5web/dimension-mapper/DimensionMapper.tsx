import { isNumber } from 'lodash';
import type { DimensionMapping } from './models';
import styles from './DimensionMapper.module.css';
import SlicingSlider from './SlicingSlider';
import AxisMapper from './AxisMapper';

interface Props {
  rawDims: number[];
  mapperState: DimensionMapping;
  onChange: (d: DimensionMapping) => void;
}

function DimensionMapper(props: Props) {
  const { rawDims, mapperState, onChange } = props;

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
          mapperState={mapperState}
          onChange={onChange}
        />
        <AxisMapper
          axis="y"
          rawDims={rawDims}
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
              slicingIndex={val}
              rawDims={rawDims}
              mapperState={mapperState}
              onChange={onChange}
            />
          ) : undefined
        )}
      </div>
    </div>
  );
}

export default DimensionMapper;
