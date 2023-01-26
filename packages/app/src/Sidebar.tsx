import { useState } from 'react';
import { FiList, FiSearch } from 'react-icons/fi';

import styles from './Sidebar.module.css';
import Explorer from './explorer/Explorer';
import { useDataContext } from './providers/DataProvider';
import SearchContainer from './search/SearchContainer';

interface Props {
  selectedPath: string;
  onSelect: (path: string) => void;
}

enum Tab {
  Explore = 'explore',
  Search = 'search',
}

function Sidebar(props: Props) {
  const { selectedPath, onSelect } = props;

  const [tab, setTab] = useState<Tab>(Tab.Explore);

  const [searchValue, setSearchValue] = useState<string>('');

  const { getSearchablePaths } = useDataContext();

  if (!getSearchablePaths) {
    return <Explorer selectedPath={selectedPath} onSelect={onSelect} />;
  }

  return (
    <div>
      <div className={styles.btnBar}>
        <button
          className={styles.btn}
          type="button"
          role="tab"
          aria-selected={tab === Tab.Explore}
          onClick={() => setTab(Tab.Explore)}
        >
          <span className={styles.btnLike}>
            <FiList />
          </span>
        </button>
        <button
          className={styles.btn}
          type="button"
          role="tab"
          aria-selected={tab === Tab.Search}
          onClick={() => setTab(Tab.Search)}
        >
          <span className={styles.btnLike}>
            <FiSearch />
          </span>
        </button>
      </div>
      {tab === Tab.Explore && (
        <Explorer selectedPath={selectedPath} onSelect={onSelect} />
      )}
      {tab === Tab.Search && (
        <SearchContainer
          selectedPath={selectedPath}
          onSelect={onSelect}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          getSearchablePaths={getSearchablePaths}
        />
      )}
    </div>
  );
}

export default Sidebar;
