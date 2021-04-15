import { useState } from 'react';
import { FiCheck, FiClipboard } from 'react-icons/fi';
import styles from './BreadcrumbsBar.module.css';

interface Props {
  name: string;
  path: string;
}

function CopyableCrumb(props: Props) {
  const { name, path } = props;

  const [isPathCopied, setPathCopied] = useState(false);
  const CopyIcon = isPathCopied ? FiCheck : FiClipboard;

  return (
    <button
      className={styles.crumbButton}
      type="button"
      title="Copy path to clipboard"
      onClick={() => {
        navigator.clipboard.writeText(path);
        setPathCopied(true);
      }}
      onPointerOut={() => setPathCopied(false)}
      data-current
    >
      <span className={styles.crumb}>{name}</span>
      <CopyIcon className={styles.copyIcon} />
    </button>
  );
}

export default CopyableCrumb;
