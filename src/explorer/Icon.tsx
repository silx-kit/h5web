import React from 'react';
import {
  FiHash,
  FiFolder,
  FiChevronDown,
  FiChevronRight,
  FiLayers,
} from 'react-icons/fi';
import { IconType } from 'react-icons';

import { HDF5Link, HDF5Collection } from '../models/metadata';

import styles from './Icon.module.css';

const LEAF_ICONS: Record<HDF5Collection, IconType> = {
  [HDF5Collection.Groups]: FiFolder,
  [HDF5Collection.Datasets]: FiLayers,
  [HDF5Collection.Datatypes]: FiHash,
};

interface Props {
  data: HDF5Link;
  isBranch: boolean;
  isExpanded: boolean;
}

function Icon(props: Props): JSX.Element {
  const { data, isBranch, isExpanded } = props;

  if (isBranch) {
    return isExpanded ? (
      <FiChevronDown className={styles.icon} />
    ) : (
      <FiChevronRight className={styles.icon} />
    );
  }

  const LeafIcon = LEAF_ICONS[data.collection];
  return <LeafIcon className={styles.icon} />;
}

export default Icon;
