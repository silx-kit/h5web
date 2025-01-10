import type { ProvidedEntity } from '@h5web/shared/hdf5-models';

import styles from './RawInspector.module.css';

const KEYS_TO_SKIP = new Set(['parents', 'children', 'value']);

interface Props {
  entity: ProvidedEntity;
}

function RawInspector(props: Props) {
  const { entity } = props;

  return (
    <details>
      <summary className={styles.heading}>Inspect</summary>
      <pre className={styles.content}>
        {JSON.stringify(
          entity,
          (key, value: unknown) => {
            // Bypass `value` and cyclic dependencies
            return KEYS_TO_SKIP.has(key) ? undefined : value;
          },
          2,
        )}
      </pre>
    </details>
  );
}

export default RawInspector;
