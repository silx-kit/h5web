import React, { ReactElement } from 'react';
import type { HDF5Attribute } from '../providers/models';
import styles from './MetadataViewer.module.css';

interface Props {
  attributes?: HDF5Attribute[];
}

function AttributesInfo(props: Props): ReactElement {
  const { attributes } = props;

  if (!attributes || attributes.length === 0) {
    return <></>;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th colSpan={2}>Attributes</th>
        </tr>
      </thead>
      <tbody>
        {attributes.map(
          ({ name, value }: HDF5Attribute): ReactElement => (
            <tr key={name}>
              <th>{name}</th>
              <td>{JSON.stringify(value)}</td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}

export default AttributesInfo;
