import React, { ElementType } from 'react';
import { HDF5Dataset } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import VisSelector from './VisSelector';
import { getSupportedVis, useActiveVis } from './utils';
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

function DatasetVisualizer(props: Props): JSX.Element {
  const { dataset } = props;

  const supportedVis = getSupportedVis(dataset);
  const [activeVis, setActiveVis] = useActiveVis(supportedVis);

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
        {dataset ? (
          activeVis && (
            <VisDisplay
              key={dataset.id}
              activeVis={activeVis}
              dataset={dataset}
            />
          )
        ) : (
          <p className={styles.noVis}>Nothing to visualize</p>
        )}
      </div>
    </div>
  );
}

// Optimise consecutive renders when selecting a link in the explorer
export default React.memo(DatasetVisualizer);
