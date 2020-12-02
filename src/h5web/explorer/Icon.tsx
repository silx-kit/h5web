import React, { ReactElement } from 'react';
import {
  FiHash,
  FiFolder,
  FiChevronDown,
  FiChevronRight,
  FiLayers,
  FiLink,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { MyHDF5Entity, MyHDF5EntityKind } from '../providers/models';
import styles from './Explorer.module.css';
import { isMyGroup } from '../providers/utils';

const LEAF_ICONS: Record<MyHDF5EntityKind, IconType> = {
  [MyHDF5EntityKind.Group]: FiFolder,
  [MyHDF5EntityKind.Dataset]: FiLayers,
  [MyHDF5EntityKind.Datatype]: FiHash,
  [MyHDF5EntityKind.Link]: FiLink,
};

interface Props {
  entity: MyHDF5Entity;
  isExpanded: boolean;
}

function Icon(props: Props): ReactElement {
  const { entity, isExpanded } = props;

  if (isMyGroup(entity)) {
    return isExpanded ? (
      <FiChevronDown className={styles.icon} />
    ) : (
      <FiChevronRight className={styles.icon} />
    );
  }

  const LeafIcon = LEAF_ICONS[entity.kind];
  return <LeafIcon className={styles.icon} />;
}

export default Icon;
