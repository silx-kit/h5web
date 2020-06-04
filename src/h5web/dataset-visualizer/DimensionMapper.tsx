import React, { Fragment } from 'react';
import ReactSlider from 'react-slider';
import { isNumber } from 'lodash-es';
import type { Vis, DimensionMapping, MappingType } from './models';
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
      // eslint-disable-next-line react/no-array-index-key
      <Fragment key={dimension}>
        <span className={styles.sliderLabel}>D{dimension}</span>
        <ReactSlider
          className={styles.slider}
          trackClassName={styles.sliderTrack}
          thumbClassName={styles.sliderThumb}
          renderThumb={(thumbProps, state) => (
            <div {...thumbProps}>{state.valueNow}</div>
          )}
          defaultValue={slicingIndex}
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
      </Fragment>
    );
  }

  function renderAxisMapper(axis: 'x' | 'y'): JSX.Element {
    const selectedDim = mapperState.indexOf('x');
    return (
      <div className={styles.axisMapper}>
        <span className={styles.axisName}>{axis}</span>
        <ToggleGroup
          role="radiogroup"
          ariaLabel={`Dimension as ${axis} axis`}
          value={selectedDim.toString()}
          onChange={(val) => {
            const newDim = Number(val);
            if (selectedDim !== newDim) {
              const newMapperState = mapperState.slice();
              newMapperState[selectedDim] = 0; // reset slicing index of previously selected dimension
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
      <div className={styles.axisMapperWrapper}>{renderAxisMapper('x')}</div>
      <div className={styles.sliderWrapper}>
        {mapperState.map(renderSlicingSlider)}
      </div>
    </div>
  );
}

export default DimensionMapper;
