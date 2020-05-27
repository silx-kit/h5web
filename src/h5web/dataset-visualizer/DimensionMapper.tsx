import React from 'react';
import ReactSlider from 'react-slider';
import { Vis, DimensionMapping } from './models';
import { useVisProps } from './VisProvider';
import ButtonGroup from '../visualizations/shared/ButtonGroup';
import styles from './DimensionMapper.module.css';

interface Props {
  activeVis: Vis;
  onChange: (d: DimensionMapping) => void;
}

function DimensionMapper(props: Props): JSX.Element {
  const { activeVis, onChange } = props;
  const { rawDims, mapping } = useVisProps();

  if (activeVis === Vis.Line && rawDims.length === 2) {
    return (
      <div className={styles.mapper}>
        <div className={styles.buttonGroupWrapper}>
          <span className={styles.buttonGroupLabel}>X</span>
          <ButtonGroup
            className={styles.buttonGroup}
            buttonClassName={styles.btn}
            buttons={Object.keys(rawDims).map(dimKey => {
              const dimIndex = Number(dimKey);
              return {
                label: dimKey,
                isSelected: mapping.x === dimIndex,
                onClick: () => {
                  if (mapping.x !== dimIndex) {
                    const newMapping: DimensionMapping = {
                      x: dimIndex,
                      slicingIndices: { [mapping.x]: 0 },
                    };
                    onChange(newMapping);
                  }
                },
              };
            })}
          />
        </div>
        <div className={styles.sliderWrapper}>
          {Object.entries(mapping.slicingIndices).map(
            ([dimNumber, slicingIndex]) => (
              <>
                <button
                  type="button"
                  className={styles.btn}
                  aria-pressed="true"
                >
                  {dimNumber}
                </button>
                <ReactSlider
                  key={dimNumber}
                  className={styles.slider}
                  trackClassName={styles.sliderTrack}
                  thumbClassName={styles.sliderThumb}
                  renderThumb={(thumbProps, state) => (
                    <div {...thumbProps}>{state.valueNow}</div>
                  )}
                  defaultValue={slicingIndex}
                  onChange={values => {
                    if (values === undefined) {
                      return;
                    }
                    const newMapping: DimensionMapping = {
                      x: mapping.x,
                      slicingIndices: {
                        ...mapping.slicingIndices,
                        [Number(dimNumber)]: values as number,
                      },
                    };
                    onChange(newMapping);
                  }}
                  min={0}
                  max={rawDims[Number(dimNumber)] - 1}
                  step={1}
                  orientation="vertical"
                  invert
                />
              </>
            )
          )}
        </div>
      </div>
    );
  }

  return <></>;
}

export default DimensionMapper;
