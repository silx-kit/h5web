import styles from './MetadataViewer.module.css';
import type { PropsWithChildren } from '.pnpm/@types+react@17.0.27/node_modules/@types/react';

interface Props {
  title: string;
}

function MetadataTable(props: PropsWithChildren<Props>) {
  const { title, children } = props;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col" colSpan={2}>
            {title}
          </th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export default MetadataTable;
