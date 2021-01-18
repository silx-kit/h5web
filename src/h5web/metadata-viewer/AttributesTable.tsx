import type { ReactElement } from 'react';
import type { HDF5Attribute } from '../providers/hdf5-models';
import styles from './MetadataViewer.module.css';

interface Props {
  attributes: HDF5Attribute[];
}

function AttributesTable(props: Props): ReactElement {
  const { attributes } = props;

  if (attributes.length === 0) {
    return <></>;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col" colSpan={2}>
            Attributes
          </th>
        </tr>
      </thead>
      <tbody>
        {attributes.map(
          ({ name, value }: HDF5Attribute): ReactElement => (
            <tr key={name}>
              <th scope="row">{name}</th>
              <td>{JSON.stringify(value)}</td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}

export default AttributesTable;
