import { type ChildEntity } from '@h5web/shared/hdf5-models';

import { useDataContext } from '../providers/DataProvider';
import styles from './Explorer.module.css';
import { needsNxBadge } from './utils';

interface Props {
  entity: ChildEntity;
}

function NxBadge(props: Props) {
  const { entity } = props;
  const { attrValuesStore } = useDataContext();

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
