import { type Group } from '@h5web/shared/hdf5-models';

import { useDataContext } from '../providers/DataProvider';
import { resolvePath } from '../visualizer/utils';
import styles from './Explorer.module.css';

interface Props {
  group: Group;
}

function NxBadge(props: Props) {
  const { group } = props;
  const { entitiesStore, attrValuesStore } = useDataContext();

  try {
    const resolution = resolvePath(group.path, entitiesStore, attrValuesStore);

    if (!resolution?.supportedVis.some((vis) => vis.name.startsWith('NX'))) {
      return null;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return null; // no badge if malformed NeXus metadata
    }

    throw error; // Suspense promises
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
