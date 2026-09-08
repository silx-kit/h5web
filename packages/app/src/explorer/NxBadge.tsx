import { type Group } from '@h5web/shared/hdf5-models';
import { useQuery } from '@tanstack/react-query';

import { useDataContext } from '../providers/DataProvider';
import { resolvePathQuery } from '../visualizer/queries';
import styles from './Explorer.module.css';

interface Props {
  group: Group;
}

function NxBadge(props: Props) {
  const { group } = props;
  const dataContext = useDataContext();

  const { data: resolution, isPending } = useQuery(
    resolvePathQuery(group.path, dataContext),
  );

  if (isPending) {
    return <span data-testid="LoadingNxBadge" />;
  }

  if (!resolution?.supportedVis.some((vis) => vis.name.startsWith('NX'))) {
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
