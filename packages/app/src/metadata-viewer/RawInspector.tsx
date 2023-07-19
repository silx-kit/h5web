import type { ProvidedEntity } from '@h5web/shared';

import styles from './RawInspector.module.css';

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
          (key, value) => {
            // Bypass cyclic dependencies
            return key !== 'parents' && key !== 'children' ? value : undefined;
          },
          2,
        )}
      </pre>
    </details>
  );
}

export default RawInspector;
