import { useDataContext } from '../../providers/DataProvider';
import SearchBox from './SearchBox';
import styles from './SearchBox.module.css';

interface Props {
  onSelect: (path: string) => void;
}

const BASE = '/';

function SearchBoxContainer(props: Props) {
  const { onSelect } = props;

  const { searchablePaths } = useDataContext();

  if (!searchablePaths) {
    return null;
  }

  return (
    <div className={styles.container}>
      <SearchBox paths={searchablePaths.get(BASE)} onSelect={onSelect} />
    </div>
  );
}

export default SearchBoxContainer;
