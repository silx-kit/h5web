import { type FallbackProps } from 'react-error-boundary';

import styles from './MetadataViewer.module.css';

function AttrErrorFallback(props: FallbackProps) {
  const { error } = props;

  return (
    <tr>
      <td className={styles.error}>
        {error instanceof Error ? error.message : 'Unknown error'}
      </td>
    </tr>
  );
}

export default AttrErrorFallback;
