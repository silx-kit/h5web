import styles from './Search.module.css';
import SearchList from './SearchList';

interface Props {
  searchValue: string;
  setSearchValue: (newValue: string) => void;
  selectedPath: string;
  onSelect: (path: string) => void;
  getSearchablePaths: (path: string) => Promise<string[]>;
}

function SearchContainer(props: Props) {
  const {
    searchValue,
    setSearchValue,
    onSelect,
    getSearchablePaths,
    selectedPath,
  } = props;

  return (
    <div className={styles.container}>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={searchValue}
          placeholder="Search for an entity"
          onChange={(e) => {
            setSearchValue(e.target.value);
          }}
          type="text"
          aria-label="Path to search"
        />
      </div>
      <SearchList
        value={searchValue}
        onSelect={onSelect}
        getSearchablePaths={getSearchablePaths}
        selectedPath={selectedPath}
      />
    </div>
  );
}

export default SearchContainer;
