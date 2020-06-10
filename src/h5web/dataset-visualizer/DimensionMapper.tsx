import React from 'react';
import ReactSlider from 'react-slider';
import { isNumber } from 'lodash-es';
import type { Vis, DimensionMapping, MappingType, Axis } from './models';
import styles from './DimensionMapper.module.css';
import ToggleGroup from '../visualizations/shared/ToggleGroup';

interface Props {
  activeVis: Vis;
  rawDims: number[];
  mapperState: DimensionMapping;
  onChange: (d: DimensionMapping) => void;
}

function DimensionMapper(props: Props): JSX.Element {
  const { rawDims, mapperState, onChange } = props;

  function renderSlicingSlider(
    slicingIndex: MappingType,
    dimension: number
  ): JSX.Element | undefined {
    // Do not show a slider for 'x' or 'y'
    if (!isNumber(slicingIndex)) {
      return undefined;
    }

    return (
      <div key={dimension} className={styles.sliderWrapper}>
        <span className={styles.sliderLabel}>D{dimension}</span>
        <ReactSlider
          key={String(mapperState.includes('y'))}
          className={styles.slider}
          trackClassName={styles.sliderTrack}
          thumbClassName={styles.sliderThumb}
          renderThumb={(thumbProps, state) => (
            <div {...thumbProps}>{state.valueNow}</div>
          )}
          value={slicingIndex}
          onChange={(value) => {
            if (!isNumber(value)) {
              return;
            }
            const newMapperState = mapperState.slice();
            newMapperState[dimension] = value;
            onChange(newMapperState);
          }}
          min={0}
          max={rawDims[dimension] - 1}
          step={1}
          orientation="vertical"
          invert
        />
      </div>
    );
  }

  function renderAxisMapper(axis: Axis): JSX.Element {
    const selectedDim = mapperState.indexOf(axis);
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
              const newMapperState = mapperState.slice();
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

  return (
    <div className={styles.mapper}>
      <div className={styles.axisMapperWrapper}>
        <div className={styles.dims}>
          <span className={styles.dimsLabel}>n</span>
          {rawDims.map((d, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={`${i}${d}`} className={styles.dimSize}>
              {d}
            </span>
          ))}
        </div>
        {renderAxisMapper('x')}
        {mapperState.includes('y') && renderAxisMapper('y')}
      </div>
      <div className={styles.sliders}>
        {mapperState.map(renderSlicingSlider)}
      </div>
    </div>
  );
}

export default DimensionMapper;
