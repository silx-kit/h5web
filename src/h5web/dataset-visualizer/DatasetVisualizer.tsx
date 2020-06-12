import React, { ReactElement, useMemo } from 'react';
import { useSetState } from 'react-use';
import type { HDF5Dataset } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import VisSelector from './VisSelector';
import { getSupportedVis } from './utils';
import VisDisplay from './VisDisplay';
import type { Vis, DimensionMapping } from './models';
import { VIS_DEFS } from '../visualizations';
import { isSimpleShape } from '../providers/utils';
import DimensionMapper from './DimensionMapper';

interface Props {
  dataset?: HDF5Dataset;
}

interface State {
  activeVis?: Vis;
  mapperState?: DimensionMapping;
  prevDataset?: HDF5Dataset;
}

function DatasetVisualizer(props: Props): ReactElement {
  const { dataset } = props;

  const supportedVis = useMemo(() => getSupportedVis(dataset), [dataset]);
  const datasetDims =
    dataset && isSimpleShape(dataset.shape) ? dataset.shape.dims : [];

  const [state, mergeState] = useSetState<State>({});
  const { activeVis, mapperState, prevDataset } = state;

  // Update state when dataset changes
  // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
  if (dataset !== prevDataset) {
    const nextActiveVis =
      activeVis && supportedVis.includes(activeVis)
        ? activeVis
        : supportedVis[supportedVis.length - 1];

    mergeState({
      activeVis: nextActiveVis,
      mapperState: VIS_DEFS[nextActiveVis].defaultMappingState(datasetDims),
      prevDataset: dataset,
    });
  }

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
              mapperState: VIS_DEFS[vis].defaultMappingState(datasetDims),
            });
          }}
        />
        {VisToolbar && <VisToolbar />}
      </div>
      <div className={styles.displayArea}>
        {dataset && activeVis ? (
          <>
            {mapperState && (
              <DimensionMapper
                activeVis={activeVis}
                rawDims={datasetDims}
                mapperState={mapperState}
                onChange={(nextMapperState) => {
                  mergeState({ mapperState: nextMapperState });
                }}
              />
            )}
            <VisDisplay
              key={dataset.id}
              activeVis={activeVis}
              dataset={dataset}
              mapperState={mapperState}
            />
          </>
        ) : (
          <p className={styles.noVis}>Nothing to visualize</p>
        )}
      </div>
    </div>
  );
}

// Optimise consecutive renders when selecting a link in the explorer
export default React.memo(DatasetVisualizer);
