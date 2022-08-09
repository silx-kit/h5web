import { isGroup, EntityKind } from '@h5web/shared';
import type { ChildEntity } from '@h5web/shared';
import {
  FiHash,
  FiChevronDown,
  FiChevronRight,
  FiLayers,
  FiLink,
} from 'react-icons/fi';

import styles from './Explorer.module.css';

const LEAF_ICONS = {
  [EntityKind.Dataset]: FiLayers,
  [EntityKind.Datatype]: FiHash,
  [EntityKind.Unresolved]: FiLink,
};

interface Props {
  entity: ChildEntity;
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
