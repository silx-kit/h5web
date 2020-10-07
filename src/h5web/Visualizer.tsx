import React, { ReactElement } from 'react';
import type { HDF5Entity } from './providers/models';
import DatasetVisualizer from './dataset-visualizer/DatasetVisualizer';
import { isDataset, isGroup } from './providers/utils';
import NexusVisualizer from './nexus-visualizer/NexusVisualizer';
import styles from './Visualizer.module.css';

interface Props {
  entity?: HDF5Entity;
}

function Visualizer(props: Props): ReactElement {
  const { entity } = props;

  if (entity && isDataset(entity)) {
    return <DatasetVisualizer dataset={entity} />;
  }

  if (
    entity &&
    isGroup(entity) &&
    entity.attributes?.find(({ value }) => value === 'NXdata')
  ) {
    return <NexusVisualizer group={entity} />;
  }

  return <p className={styles.fallback}>Nothing to visualize</p>;
}

export default Visualizer;
