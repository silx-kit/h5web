import { getNameFromPath } from '../providers/utils';
import styles from './Search.module.css';
import SearchEntry from './SearchEntry';

interface Props {
  paths: string[];
  value: string;
  onChange: (newValue: string) => void;
  selectedPath: string;
  onSelect: (path: string) => void;
}

function Search(props: Props) {
  const { paths, value, onChange, selectedPath, onSelect } = props;

  const matches = value
    ? paths.filter((path) => getNameFromPath(path).includes(value))
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={value}
          placeholder="Search for an entity"
          onChange={(e) => {
            onChange(e.target.value);
          }}
          type="text"
          aria-label="Path to search"
        />
      </div>
      <ul className={styles.entries}>
        {matches.map((path) => (
          <SearchEntry
            key={path}
            path={path}
            onClick={() => {
              onSelect(path);
            }}
            isSelected={path === selectedPath}
          />
        ))}
      </ul>
    </div>
  );
}

export default Search;
