import React, { useMemo } from 'react';
import { HDF5Dataset } from '../providers/models';
import styles from './DatasetVisualizer.module.css';
import VisSelector from './VisSelector';
import { getSupportedVis, useActiveVis } from './utils';
import VisBar from './VisBar';
import VisProvider from './VisProvider';
import { Vis } from './models';
import {
  RawVis,
  ScalarVis,
  MatrixVis,
  LineVis,
  HeatmapVis,
} from '../visualizations';

const VIS_COMPONENTS = {
  [Vis.Raw]: RawVis,
  [Vis.Scalar]: ScalarVis,
  [Vis.Matrix]: MatrixVis,
  [Vis.Line]: LineVis,
  [Vis.Heatmap]: HeatmapVis,
};

interface Props {
  dataset?: HDF5Dataset;
}

function DatasetVisualizer(props: Props): JSX.Element {
  const { dataset } = props;
  const dimensionMapping = { x: 0, y: 1 };

  const supportedVis = useMemo(() => getSupportedVis(dataset), [dataset]);
  const [activeVis, setActiveVis] = useActiveVis(supportedVis);
  const ActiveVis = activeVis && VIS_COMPONENTS[activeVis];

  return (
    <div className={styles.visualizer}>
      <div className={styles.visBar}>
        <VisSelector
          activeVis={activeVis}
          choices={supportedVis}
          onChange={setActiveVis}
        />
        <div className={styles.toolbar}>
          <VisBar vis={activeVis} />
        </div>
      </div>
      <div className={styles.displayArea}>
        {dataset ? (
          ActiveVis && (
            <VisProvider
              key={dataset.id}
              mapping={dimensionMapping}
              dataset={dataset}
            >
              <ActiveVis />
            </VisProvider>
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
