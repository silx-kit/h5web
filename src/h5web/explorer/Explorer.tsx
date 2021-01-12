import { useContext, ReactElement, Suspense } from 'react';
import { FiFileText, FiRefreshCw } from 'react-icons/fi';
import EntityList from './EntityList';
import styles from './Explorer.module.css';
import { ProviderContext } from '../providers/context';

interface Props {
  selectedPath: string;
  onSelect: (path: string) => void;
}

function Explorer(props: Props): ReactElement {
  const { selectedPath, onSelect } = props;
  const { domain } = useContext(ProviderContext);

  return (
    <div className={styles.explorer} role="tree">
      <button
        className={styles.domainBtn}
        type="button"
        role="treeitem"
        aria-selected={selectedPath === '/'}
        onClick={() => onSelect('/')}
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
          onSelect={onSelect}
        />
      </Suspense>
    </div>
  );
}

export default Explorer;
