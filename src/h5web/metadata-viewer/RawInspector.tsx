import type { Entity } from '../providers/models';

import styles from './RawInspector.module.css';

interface Props {
  entity: Entity;
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
          2
        )}
      </pre>
    </details>
  );
}

export default RawInspector;
