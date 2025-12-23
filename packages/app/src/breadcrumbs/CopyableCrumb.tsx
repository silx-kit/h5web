import { useTimeoutEffect, useToggle } from '@react-hookz/web';
import { FiCheck, FiClipboard } from 'react-icons/fi';

import styles from './BreadcrumbsBar.module.css';

interface Props {
  name: string;
  path: string;
}

function CopyableCrumb(props: Props) {
  const { name, path } = props;

  const [isPathCopied, togglePathCopied] = useToggle();
  const CopyIcon = isPathCopied ? FiCheck : FiClipboard;

  useTimeoutEffect(togglePathCopied, isPathCopied ? 3000 : undefined);

  return (
    <button
      className={styles.crumbButton}
      type="button"
      title="Copy path to clipboard"
      aria-label={`${name} (copy path)`}
      data-current
      data-copied={isPathCopied || undefined}
      onClick={() => {
        void navigator.clipboard.writeText(path);
        togglePathCopied(true);
      }}
    >
      <span className={styles.crumb}>{name}</span>
      <CopyIcon className={styles.copyIcon} />
    </button>
  );
}

export default CopyableCrumb;
