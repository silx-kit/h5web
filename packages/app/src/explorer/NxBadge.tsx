import type { Entity } from '@h5web/shared';
import { useContext } from 'react';

import { ProviderContext } from '../providers/context';
import styles from './Explorer.module.css';
import { needsNxBadge } from './utils';

interface Props {
  entity: Entity;
}

function NxBadge(props: Props) {
  const { entity } = props;
  const { attrValuesStore } = useContext(ProviderContext);

  if (!needsNxBadge(entity, attrValuesStore)) {
    return null;
  }

  return (
    <>
      {' '}
      <span className={styles.nx} aria-label="(NeXus group)">
        NX
      </span>
    </>
  );
}

export default NxBadge;
