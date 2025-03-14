import { getNameFromPath } from '@h5web/shared/hdf5-utils';
import { useEffect, useState } from 'react';

import styles from './Search.module.css';
import SearchItem from './SearchItem';

interface Props {
  value: string;
  selectedPath: string;
  onSelect: (path: string) => void;
  getSearchablePaths: (path: string) => Promise<string[]>;
}

const BASE = '/';

function SearchList(props: Props) {
  const { value, selectedPath, onSelect, getSearchablePaths } = props;

  const [paths, setPaths] = useState<string[]>();

  useEffect(() => {
    async function fetchPaths() {
      setPaths(await getSearchablePaths(BASE));
    }
    if (!paths) {
      void fetchPaths();
    }
  }, [paths, getSearchablePaths]);

  if (!paths) {
    return <div>Loading paths...</div>;
  }

  const matches = value
    ? paths.filter((path) => getNameFromPath(path).includes(value))
    : [];

  return (
    <ul className={styles.entries}>
      {matches.map((path) => (
        <SearchItem
          key={path}
          path={path}
          onClick={() => {
            onSelect(path);
          }}
          isSelected={path === selectedPath}
        />
      ))}
    </ul>
  );
}

export default SearchList;
