import {
  type PropsWithChildren,
  useCallback,
  useSyncExternalStore,
} from 'react';

import { useDataContext } from '../providers/DataProvider';
import { type ValueQueryParams } from '../providers/models';
import { isValueInCache } from '../utils';
import { useConfirmedSize } from './fetch-confirmation';
import styles from './LargeValueGuard.module.css';
import { formatBytes, getValueSize, MAX_AUTO_FETCH_SIZE } from './utils';

interface Props {
  requests: ValueQueryParams[]; // all values about to be fetched
}

/* Ask user for confirmation before fetching very large values */
function LargeValueGuard(props: PropsWithChildren<Props>) {
  const { requests, children } = props;

  const dataContext = useDataContext();
  const queryCache = dataContext.queryClient.getQueryCache();

  const datasetPaths = requests.map(({ dataset }) => dataset.path);
  const [confirmedSize, confirmSize] = useConfirmedSize(datasetPaths.join('|'));

  // Don't ask again for fetches no larger than previously confirmed (e.g. other slices)
  const maxSize = Math.max(MAX_AUTO_FETCH_SIZE, confirmedSize);

  /* Re-check when values are added to or removed from the cache; snapshot is `0` unless
   * confirmation is needed, to avoid re-renders. Ignore other events: they may be fired
   * while children render (e.g. when the fetched value's query gets observed), when
   * updating this component would not be allowed and, since an update made right after
   * confirmation hasn't been committed yet, would loop forever. */
  const subscribe = useCallback(
    (onChange: () => void) =>
      queryCache.subscribe((event) => {
        if (
          event.type === 'removed' ||
          (event.type === 'updated' && event.action.type === 'success')
        ) {
          onChange();
        }
      }),
    [queryCache],
  );
  const size = useSyncExternalStore(subscribe, () => {
    if (getTotalSize(requests) <= maxSize) {
      return 0; // no need to check cache
    }

    const uncachedSize = getTotalSize(
      requests.filter(({ dataset, selection }) => {
        return !isValueInCache(dataContext, dataset, selection);
      }),
    );
    return uncachedSize > maxSize ? uncachedSize : 0;
  });

  if (size === 0) {
    return children;
  }

  const isSlice = requests.some(({ selection }) => selection !== undefined);

  return (
    <div className={styles.prompt}>
      <p>
        {isSlice ? 'Slice' : 'Dataset'} too large to be loaded automatically (
        {formatBytes(size)})
      </p>
      <p className={styles.hint}>
        Loading it may take a long time or fail. You may want to select a
        visualization that requires less data.
      </p>
      <button
        className={styles.loadBtn}
        type="button"
        onClick={() => confirmSize(size)}
      >
        Load anyway?
      </button>
    </div>
  );
}

function getTotalSize(requests: ValueQueryParams[]): number {
  const uniqueRequests = new Map(
    requests.map((req) => [`${req.dataset.path}|${req.selection ?? ''}`, req]),
  );

  return [...uniqueRequests.values()].reduce(
    (acc, { dataset, selection }) => acc + getValueSize(dataset, selection),
    0,
  );
}

export default LargeValueGuard;
