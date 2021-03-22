import {
  FiHash,
  FiFolder,
  FiChevronDown,
  FiChevronRight,
  FiLayers,
  FiLink,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { Entity, EntityKind } from '../providers/models';
import styles from './Explorer.module.css';
import { isGroup } from '../guards';

const LEAF_ICONS: Record<EntityKind, IconType> = {
  [EntityKind.Group]: FiFolder,
  [EntityKind.Dataset]: FiLayers,
  [EntityKind.Datatype]: FiHash,
  [EntityKind.Link]: FiLink,
};

interface Props {
  entity: Entity;
  isExpanded: boolean;
}

function Icon(props: Props) {
  const { entity, isExpanded } = props;

  if (isGroup(entity)) {
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
