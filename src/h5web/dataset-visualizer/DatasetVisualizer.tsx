import React, { ReactElement, useEffect, useContext } from 'react';
import { useSetState, useTimeoutFn } from 'react-use';
import type { HDF5Dataset, HDF5Value } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import VisSelector from './VisSelector';
import VisDisplay from './VisDisplay';
import type { Vis, DimensionMapping } from './models';
import { VIS_DEFS } from '../visualizations';
import { ProviderContext } from '../providers/context';
import { useSupportedVis } from './hooks';

interface Props {
  dataset?: HDF5Dataset;
}

interface State {
  activeVis?: Vis;
  value?: HDF5Value;
  loading?: boolean;
  mapperState?: DimensionMapping;
  prevDataset?: HDF5Dataset;
}

function DatasetVisualizer(props: Props): ReactElement {
  const { dataset } = props;

  const supportedVis = useSupportedVis(dataset);
  const [state, mergeState] = useSetState<State>({});
  const { activeVis, value, loading, mapperState, prevDataset } = state;

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

  const { getValue } = useContext(ProviderContext);
  const [scheduleLoadingFlag, cancelLoadingFlag] = useTimeoutFn(() => {
    mergeState({ loading: true });
  }, 50);

  // Fetch dataset value asynchronously
  useEffect(() => {
    if (!dataset) {
      return;
    }

    scheduleLoadingFlag(); // in case retrieving value takes too long (e.g. initial fetch of `SilxProvider`)

    getValue(dataset.id).then((val) => {
      cancelLoadingFlag();
      mergeState({ value: val, loading: false });
    });
  }, [cancelLoadingFlag, dataset, getValue, mergeState, scheduleLoadingFlag]);

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
            loading={!!loading}
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
