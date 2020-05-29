import React, { Fragment } from 'react';
import ReactSlider from 'react-slider';
import { isNumber } from 'lodash-es';
import { Vis, DimensionMapping, MappingType } from './models';
import ButtonGroup from '../visualizations/shared/ButtonGroup';
import styles from './DimensionMapper.module.css';

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
          onChange={value => {
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

  function renderDimensionButton(dimension: 'x' | 'y'): JSX.Element {
    return (
      <div className={styles.dimensionButtonWrapper}>
        <span className={styles.dimensionName}>{dimension}</span>
        <ButtonGroup
          ariaLabel={`Dimension as ${dimension}`}
          className={styles.buttonGroup}
          buttonClassName={styles.btn}
          buttons={Object.keys(rawDims).map(dimKey => {
            const dimIndex = Number(dimKey);
            return {
              label: `D${dimIndex}`,
              isSelected: mapperState[dimIndex] === dimension,
              onClick: () => {
                const prevX = mapperState.indexOf(dimension);
                if (prevX !== dimIndex) {
                  const newMapperState = mapperState.slice();
                  newMapperState[prevX] = 0;
                  newMapperState[dimIndex] = dimension;
                  onChange(newMapperState);
                }
              },
            };
          })}
        />
      </div>
    );
  }

  return (
    <div className={styles.mapper}>
      <div className={styles.buttonGroupWrapper}>
        {renderDimensionButton('x')}
      </div>
      <div className={styles.sliderWrapper}>
        {mapperState.map(renderSlicingSlider)}
      </div>
    </div>
  );
}

export default DimensionMapper;
