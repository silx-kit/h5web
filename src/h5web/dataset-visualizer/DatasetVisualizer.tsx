import React, { ReactElement, useMemo, useEffect, useContext } from 'react';
import { useSetState } from 'react-use';
import type { HDF5Dataset, HDF5Value } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import VisSelector from './VisSelector';
import { getSupportedVis } from './utils';
import VisDisplay from './VisDisplay';
import type { Vis, DimensionMapping } from './models';
import { VIS_DEFS } from '../visualizations';
import { ProviderContext } from '../providers/context';

interface Props {
  dataset?: HDF5Dataset;
}

interface State {
  activeVis?: Vis;
  value?: HDF5Value;
  mapperState?: DimensionMapping;
  prevDataset?: HDF5Dataset;
}

function DatasetVisualizer(props: Props): ReactElement {
  const { dataset } = props;

  const supportedVis = useMemo(() => getSupportedVis(dataset), [dataset]);

  const [state, mergeState] = useSetState<State>({});
  const { activeVis, value, mapperState, prevDataset } = state;

  // Reset state when dataset changes
  // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
  if (dataset !== prevDataset) {
    const nextActiveVis =
      activeVis && supportedVis.includes(activeVis)
        ? activeVis
        : supportedVis[supportedVis.length - 1];

    mergeState({
      activeVis: nextActiveVis,
      value: undefined, // reset value
      mapperState:
        dataset && VIS_DEFS[nextActiveVis].defaultMappingState(dataset),
      prevDataset: dataset,
    });
  }

  // Fetch dataset value asynchronously
  const { getValue } = useContext(ProviderContext);
  useEffect(() => {
    if (dataset) {
      getValue(dataset.id).then((val) => {
        mergeState({ value: val });
      });
    }
  }, [dataset, getValue, mergeState]);

  const VisToolbar = activeVis && VIS_DEFS[activeVis].Toolbar;

  return (
    <div className={styles.visualizer}>
      <div className={styles.visBar}>
        <VisSelector
          activeVis={activeVis}
          choices={supportedVis}
          onChange={(vis) => {
            mergeState({
              activeVis: vis,
              mapperState:
                dataset && VIS_DEFS[vis].defaultMappingState(dataset),
            });
          }}
        />
        {VisToolbar && <VisToolbar />}
      </div>
      <div className={styles.displayArea}>
        {dataset && activeVis ? (
          <VisDisplay
            activeVis={activeVis}
            dataset={dataset}
            value={value}
            mapperState={mapperState}
            onMapperStateChange={(nextMapperState) => {
              mergeState({ mapperState: nextMapperState });
            }}
          />
        ) : (
          <p className={styles.noVis}>Nothing to visualize</p>
        )}
      </div>
    </div>
  );
}

// Optimise consecutive renders when selecting a link in the explorer
export default React.memo(DatasetVisualizer);
