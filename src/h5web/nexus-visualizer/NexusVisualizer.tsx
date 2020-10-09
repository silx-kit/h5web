import React, { ReactElement } from 'react';
import type { HDF5Group } from '../providers/models';
import { getAttributeValue, getInterpretationVis } from './utils';
import styles from '../Visualizer.module.css';
import { useEntity } from '../providers/hooks';
import { isDataset } from '../providers/utils';
import VisSelector from '../dataset-visualizer/VisSelector';
import VisDisplay from '../dataset-visualizer/VisDisplay';
import { VIS_DEFS } from '../visualizations';
import { getSupportedVis } from '../dataset-visualizer/utils';
import { NXDataAttribute } from './models';

interface Props {
  group: HDF5Group;
}

function NexusVisualizer(props: Props): ReactElement {
  const { group } = props;

  const signalDatasetTitle = getAttributeValue(group, NXDataAttribute.Signal);
  const signalLink =
    signalDatasetTitle &&
    group.links?.find((l) => l.title === signalDatasetTitle);
  const signalDataset = useEntity(signalLink);

  if (signalDatasetTitle === undefined) {
    return (
      <p className={styles.fallback}>NXdata group has no attribute signal.</p>
    );
  }

  if (!signalLink || !signalDataset) {
    return (
      <p className={styles.fallback}>
        NXdata signal {signalDatasetTitle} points to an non-existing dataset.
      </p>
    );
  }

  if (!signalDataset || !isDataset(signalDataset)) {
    return (
      <p className={styles.fallback}>
        NXdata signal {signalDatasetTitle} is not a valid dataset.
      </p>
    );
  }

  const supportedVis = getSupportedVis(signalDataset);
  const interpretationVis = getInterpretationVis(group);
  // Prefer vis deduced from interpretation. Else take the first supported vis.
  const nexusVis =
    interpretationVis && supportedVis.includes(interpretationVis)
      ? interpretationVis
      : supportedVis[supportedVis.length - 1];

  const VisToolbar = VIS_DEFS[nexusVis].Toolbar;

  return (
    <div className={styles.visualizer}>
      <div className={styles.visBar}>
        <VisSelector activeVis={nexusVis} choices={[nexusVis]} />
        {VisToolbar && <VisToolbar />}
      </div>
      <div className={styles.displayArea}>
        <VisDisplay
          key={signalDataset.id} // reset local state when dataset changes
          activeVis={nexusVis}
          dataset={signalDataset}
        />
      </div>
    </div>
  );
}

export default NexusVisualizer;
