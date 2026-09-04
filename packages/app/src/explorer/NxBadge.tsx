import { type Group } from '@h5web/shared/hdf5-models';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useDataContext } from '../providers/DataProvider';
import { resolvePathQuery } from '../visualizer/queries';
import styles from './Explorer.module.css';

interface Props {
  group: Group;
}

function NxBadge(props: Props) {
  const { group } = props;
  const dataContext = useDataContext();
  const { queryClient } = dataContext;

  const { data: show } = useSuspenseQuery({
    queryKey: [dataContext.filepath, 'nxBadge', group.path],
    queryFn: async () => {
      try {
        const resolution = await queryClient.query(
          resolvePathQuery(group.path, dataContext),
        );

        return !!resolution?.supportedVis.some((vis) =>
          vis.name.startsWith('NX'),
        );
      } catch {
        return false; // no badge if malformed NeXus metadata
      }
    },
  });

  if (!show) {
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
