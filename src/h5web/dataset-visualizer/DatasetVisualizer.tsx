import React, { ElementType, useState, ReactElement, useMemo } from 'react';
import { HDF5Dataset } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import VisSelector from './VisSelector';
import { getSupportedVis } from './utils';
import VisDisplay from './VisDisplay';
import { Vis } from './models';
import LineToolbar from '../visualizations/line/LineToolbar';
import HeatmapToolbar from '../visualizations/heatmap/HeatmapToolbar';

const VIS_TOOLBARS: Record<string, ElementType> = {
  [Vis.Line]: LineToolbar,
  [Vis.Heatmap]: HeatmapToolbar,
};

interface Props {
  dataset?: HDF5Dataset;
}

function DatasetVisualizer(props: Props): ReactElement {
  const { dataset } = props;

  const supportedVis = useMemo(() => getSupportedVis(dataset), [dataset]);
  const [prevDataset, setPrevDataset] = useState(dataset);
  const [activeVis, setActiveVis] = useState<Vis>();

  // Update active vis when dataset changes
  // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
  if (dataset !== prevDataset) {
    setPrevDataset(dataset);
    setActiveVis(
      activeVis && supportedVis.includes(activeVis)
        ? activeVis
        : supportedVis[supportedVis.length - 1]
    );
  }

  const VisToolbar = activeVis && VIS_TOOLBARS[activeVis];

  return (
    <div className={styles.visualizer}>
      <div className={styles.visBar}>
        <VisSelector
          activeVis={activeVis}
          choices={supportedVis}
          onChange={setActiveVis}
        />
        {VisToolbar && <VisToolbar />}
      </div>
      <div className={styles.displayArea}>
        {dataset && activeVis ? (
          <VisDisplay
            key={dataset.id}
            activeVis={activeVis}
            dataset={dataset}
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
