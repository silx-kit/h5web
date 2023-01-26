import { useEffect, useState } from 'react';

import Search from './Search';

interface Props {
  selectedPath: string;
  onSelect: (path: string) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  getSearchablePaths: (path: string) => Promise<string[]>;
}

const BASE = '/';

function SearchContainer(props: Props) {
  const {
    selectedPath,
    onSelect,
    searchValue,
    setSearchValue,
    getSearchablePaths,
  } = props;

  const [paths, setPaths] = useState<string[]>();

  useEffect(() => {
    const fetchPaths = async () => {
      setPaths(await getSearchablePaths(BASE));
    };
    if (!paths) {
      void fetchPaths();
    }
  }, [paths, getSearchablePaths]);

  if (!paths) {
    return null;
  }

  return (
    <Search
      value={searchValue}
      onChange={setSearchValue}
      paths={paths}
      selectedPath={selectedPath}
      onSelect={onSelect}
    />
  );
}

export default SearchContainer;
