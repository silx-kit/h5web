import type { PropsWithChildren } from 'react';

import styles from './MetadataViewer.module.css';

interface Props {
  title: string;
}

function MetadataTable(props: PropsWithChildren<Props>) {
  const { title, children } = props;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.title} scope="col" colSpan={2}>
            {title}
          </th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export default MetadataTable;
