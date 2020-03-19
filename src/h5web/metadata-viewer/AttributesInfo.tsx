import React from 'react';
import { HDF5Attribute } from '../providers/models';
import styles from './MetadataViewer.module.css';

interface Props {
  attributes?: HDF5Attribute[];
}

function AttributesInfo(props: Props): JSX.Element {
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
          ({ name, value }: HDF5Attribute): JSX.Element => (
            <tr key={name}>
              <th>{name}</th>
              <td>{value.toString()}</td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}

export default AttributesInfo;
