import { useContext, ReactElement, useState, Suspense } from 'react';
import { FiFileText, FiRefreshCw } from 'react-icons/fi';
import EntityList from './EntityList';
import styles from './Explorer.module.css';
import { ProviderContext } from '../providers/context';
import { useMount } from 'react-use';

const DEFAULT_PATH = process.env.REACT_APP_DEFAULT_PATH || '/';

interface Props {
  onSelect: (path: string) => void;
}

function Explorer(props: Props): ReactElement {
  const { onSelect } = props;

  const { domain } = useContext(ProviderContext);
  const [selectedPath, setSelectedPath] = useState<string>(DEFAULT_PATH);

  function handleSelect(path: string): void {
    setSelectedPath(path);
    onSelect(path);
  }

  useMount(() => {
    onSelect(DEFAULT_PATH);
  });

  return (
    <div className={styles.explorer} role="tree">
      <button
        className={styles.domainBtn}
        type="button"
        role="treeitem"
        aria-selected={selectedPath === '/'}
        onClick={() => handleSelect('/')}
      >
        <FiFileText className={styles.domainIcon} />
        {domain}
      </button>

      <Suspense
        fallback={
          <FiRefreshCw className={styles.spinner}>Loading...</FiRefreshCw>
        }
      >
        <EntityList
          level={0}
          parentPath="/"
          selectedPath={selectedPath}
          onSelect={handleSelect}
        />
      </Suspense>
    </div>
  );
}

export default Explorer;
