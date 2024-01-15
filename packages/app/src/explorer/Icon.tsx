import { isGroup } from '@h5web/shared/guards';
import type { ChildEntity } from '@h5web/shared/hdf5-models';
import { EntityKind } from '@h5web/shared/hdf5-models';
import {
  FiChevronDown,
  FiChevronRight,
  FiHash,
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
    return isExpanded ?
        <FiChevronDown className={styles.icon} />
      : <FiChevronRight className={styles.icon} />;
  }

  const LeafIcon = LEAF_ICONS[entity.kind];
  return <LeafIcon className={styles.icon} />;
}

export default Icon;
