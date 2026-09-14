import { type Group } from '@h5web/shared/hdf5-models';
import { useQuery } from '@tanstack/react-query';

import { useDataContext } from '../providers/DataProvider';
import styles from './Explorer.module.css';
import { nxBadgeQuery } from './utils';

interface Props {
  group: Group;
}

function NxBadge(props: Props) {
  const { group } = props;
  const dataContext = useDataContext();

  const { data: showBadge, isPending } = useQuery(
    nxBadgeQuery(group, dataContext),
  );

  if (isPending) {
    return <span data-testid="LoadingNxBadge" />;
  }

  if (!showBadge) {
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
